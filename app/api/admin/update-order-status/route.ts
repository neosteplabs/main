import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    // 🔐 Verify admin
    await requireAdmin(req);

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // ✅ Type-safe after exists check
    const order = orderSnap.data() as any;

    // 🛑 Prevent unnecessary re-processing
    if (order.status === status) {
      return NextResponse.json({ success: true });
    }

    const batch = adminDb.batch();

    /**
     * INVENTORY ADJUSTMENT
     */
    if (
      status === "completed" &&
      order.inventoryAdjusted !== true
    ) {
      for (const item of order.items) {
        const productRef = adminDb
          .collection("products")
          .doc(item.productId);

        const productSnap = await productRef.get();

        if (!productSnap.exists) {
          return NextResponse.json(
            { error: `Product missing: ${item.productId}` },
            { status: 400 }
          );
        }

        const product = productSnap.data() as any;

        const concentrations = product.concentrations.map(
          (c: any) => {
            if (c.sku === item.sku) {
              const newStock = c.stock - item.quantity;

              if (newStock < 0) {
                throw new Error(
                  `Insufficient stock for ${item.sku}`
                );
              }

              return {
                ...c,
                stock: newStock,
              };
            }

            return c;
          }
        );

        batch.update(productRef, {
          concentrations,
        });
      }

      batch.update(orderRef, {
        inventoryAdjusted: true,
        status,
        fulfillmentStatus: status,
        updatedAt: Timestamp.now(),
      });

    } else {

      // 📝 Status change only
      batch.update(orderRef, {
        status,
        fulfillmentStatus: status,
        updatedAt: Timestamp.now(),
      });

    }

    await batch.commit();

    return NextResponse.json({ success: true });

  } catch (error: any) {

    console.error("Status update error:", error);

    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 500 }
    );

  }
}