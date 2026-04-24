export interface TrackingInfo {
  carrier: string;
  estimatedDelivery: string;
  status: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered';
  currentLocation: string;
  updates: {
    date: string;
    status: string;
    location: string;
  }[];
}

export async function generateTrackingInfo(orderId: string, email: string): Promise<TrackingInfo> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return static/mocked tracking data
  return {
    carrier: "FedEx",
    estimatedDelivery: "Tomorrow by 8:00 PM",
    status: "in_transit",
    currentLocation: "Local Distribution Center",
    updates: [
      {
        date: new Date().toLocaleString(),
        status: "Arrived at Local Facility",
        location: "Local Distribution Center"
      },
      {
        date: new Date(Date.now() - 86400000).toLocaleString(),
        status: "Departed Regional Facility",
        location: "Regional Hub"
      }
    ]
  };
}
