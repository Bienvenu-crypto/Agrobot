import { NextResponse } from 'next/server';

export async function GET() {
  // Return mock data directly to avoid downloading huge CSV files
  // which can cause memory issues or timeouts on the server.
  const mockWfpData = [
    {
      crop: 'Maize (White)',
      price: 1250,
      change: '+2.4%',
      trend: 'up',
      historical: [
        { month: 'Oct', price: 1100 },
        { month: 'Nov', price: 1150 },
        { month: 'Dec', price: 1180 },
        { month: 'Jan', price: 1200 },
        { month: 'Feb', price: 1220 },
        { month: 'Mar', price: 1250 },
      ]
    },
    {
      crop: 'Beans (Nambale)',
      price: 3400,
      change: '-1.2%',
      trend: 'down',
      historical: [
        { month: 'Oct', price: 3800 },
        { month: 'Nov', price: 3750 },
        { month: 'Dec', price: 3600 },
        { month: 'Jan', price: 3550 },
        { month: 'Feb', price: 3450 },
        { month: 'Mar', price: 3400 },
      ]
    },
    {
      crop: 'Cassava Flour',
      price: 1800,
      change: '+0.0%',
      trend: 'stable',
      historical: [
        { month: 'Oct', price: 1750 },
        { month: 'Nov', price: 1800 },
        { month: 'Dec', price: 1800 },
        { month: 'Jan', price: 1850 },
        { month: 'Feb', price: 1800 },
        { month: 'Mar', price: 1800 },
      ]
    },
    {
      crop: 'Sorghum',
      price: 1500,
      change: '+5.1%',
      trend: 'up',
      historical: [
        { month: 'Oct', price: 1300 },
        { month: 'Nov', price: 1350 },
        { month: 'Dec', price: 1380 },
        { month: 'Jan', price: 1400 },
        { month: 'Feb', price: 1420 },
        { month: 'Mar', price: 1500 },
      ]
    }
  ];

  return NextResponse.json(
    { source: 'mock_fallback', data: mockWfpData },
    { status: 200 }
  );
}

