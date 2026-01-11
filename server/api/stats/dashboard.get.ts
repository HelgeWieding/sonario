import { eq, count, and, gte, inArray } from "drizzle-orm";
import { getDb, schema } from "../../db";
import { getOrCreateUser } from "../../utils/auth";
import type { DashboardStats } from "~~/shared/types";
import { productRepository } from "~~/server/repositories/product.repository";

export default defineEventHandler(async (event) => {
  const user = await getOrCreateUser(event);
  const db = getDb();

  // Get all products
  const products = await productRepository.findAll();
  const totalProducts = products.length;

  let totalFeatureRequests = 0;
  let newRequestsThisWeek = 0;
  let totalFeedback = 0;

  if (products.length > 0) {
    // Get total feature requests across all products
    for (const product of products) {
      const productId = product.id;
      const stats = await productRepository.getProductStats(productId);
      totalFeatureRequests += stats.featureRequestCount;

      // Get new requests this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [{ count: newCount }] = await db
        .select({ count: count() })
        .from(schema.featureRequests)
        .where(
          and(
            eq(schema.featureRequests.productId, productId),
            gte(schema.featureRequests.createdAt, oneWeekAgo)
          )
        );
      newRequestsThisWeek += newCount;

      // Get total feedback
      const requests = await db.query.featureRequests.findMany({
        where: eq(schema.featureRequests.productId, productId),
        columns: { id: true },
      });

      for (const request of requests) {
        const [{ count: feedbackCount }] = await db
          .select({ count: count() })
          .from(schema.feedback)
          .where(eq(schema.feedback.featureRequestId, request.id));
        totalFeedback += feedbackCount;
      }
    }
  }

  // Check Gmail connection (use first product)
  const gmailConnection =
    products.length > 0
      ? await db.query.gmailConnections.findFirst({
          where: eq(schema.gmailConnections.productId, products?.[0]?.id ?? ""),
        })
      : null;

  const stats: DashboardStats = {
    totalProducts,
    totalFeatureRequests,
    newRequestsThisWeek,
    totalFeedback,
    gmailConnected: gmailConnection?.isActive || false,
  };

  return { data: stats };
});
