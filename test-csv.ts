import Papa from 'papaparse';

async function test() {
  const res = await fetch('https://data.humdata.org/dataset/883929b1-521e-4834-97f5-0ccc2df75b89/resource/e082d683-cad5-4dcd-bf54-db76ae254d33/download/wfp_food_prices_uga.csv');
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  
  const commodities = new Set();
  const dates = new Set();
  parsed.data.forEach((row: any) => {
    if (row.commodity) commodities.add(row.commodity);
    if (row.date) dates.add(row.date);
  });
  
  console.log("Commodities:", Array.from(commodities).slice(0, 20));
  console.log("Latest dates:", Array.from(dates).sort().reverse().slice(0, 10));
}

test();
