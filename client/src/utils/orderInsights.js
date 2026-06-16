export const getHighlyDemandedDrinks = (orders = [], limit = 5) => {
  const demandMap = orders.reduce((acc, order) => {
    if (order.orderStatus === 'Cancelled') return acc;

    order.items.forEach((item) => {
      const key = item.name || item.inventoryItem || 'Unknown drink';
      const quantity = Number(item.quantity || 0);
      const revenue = Number(item.lineTotal || 0);

      if (!acc[key]) {
        acc[key] = {
          name: key,
          category: item.category || 'Drink',
          unit: item.unit || 'unit',
          imageUrl: item.imageUrl || '',
          quantity: 0,
          revenue: 0,
          orders: 0,
        };
      }

      acc[key].quantity += quantity;
      acc[key].revenue += revenue;
      acc[key].orders += 1;

      if (!acc[key].imageUrl && item.imageUrl) {
        acc[key].imageUrl = item.imageUrl;
      }
    });

    return acc;
  }, {});

  return Object.values(demandMap)
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, limit);
};
