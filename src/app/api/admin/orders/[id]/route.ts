
// src/app/api/admin/orders/[id]/route.ts
import connectDB from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id)
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    console.log(`📝 [ORDER UPDATE] ID: ${id}, Status: ${status}`);

    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`✅ [ORDER UPDATE] Order ${id} updated to ${status}`);

    if (global.io) {
      global.io.emit('order-updated', order);
      console.log("📡 [SOCKET] Order updated emitted");
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully',
      order 
    });
  } catch (error: any) {
    console.error('❌ [ORDER UPDATE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    console.log(`🗑️ [ORDER DELETE] ID: ${id}`);

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`✅ [ORDER DELETE] Order ${id} deleted`);

    if (global.io) {
      global.io.emit('order-deleted', { _id: id });
      console.log("📡 [SOCKET] Order deleted emitted");
    }

    return NextResponse.json({ 
      message: 'Order deleted successfully',
      orderId: id 
    });
  } catch (error: any) {
    console.error('❌ [ORDER DELETE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
