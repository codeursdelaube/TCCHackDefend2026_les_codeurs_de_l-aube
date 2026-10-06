import fs from 'fs';
import path from 'path';

const SITES_IMAGES = [
  {
    filename: 'akodessewa.jpg',
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'togoville.jpg',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'aneho.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'kpime.jpg',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'aklowa.jpg',
    url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'notse_agbogbo.jpg',
    url: 'https://images.unsplash.com/photo-1590845947698-8924d7409b56?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'fazao_malfakassa.jpg',
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'lac_nangbeto.jpg',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'aledjo.jpg',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'sarakawa.jpg',
    url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'oti_mandouri.jpg',
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'namoundjoga.jpg',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'grottes_nok.jpg',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'plage_lome.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'sokode.jpg',
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'dapaong.jpg',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'forgerons_tchare.jpg',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'
  }
];

const CUISINE_IMAGES = [
  {
    filename: 'wagasi.jpg',
    url: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'fetri_dessi.jpg',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'ademe_dessi.jpg',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'to_sorgho.jpg',
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'riz_gras.jpg',
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'soupe_poisson.jpg',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'hanvidokpome.jpg',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'tchoukoutou.jpg',
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'sodabi.jpg',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80'
  },
  {
    filename: 'agbeli.jpg',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80'
  }
];

async function download(url, dest) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(arrayBuffer));
    console.log(`✓ Downloaded: ${path.basename(dest)}`);
    return true;
  } catch (err) {
    console.error(`✗ Failed ${path.basename(dest)}: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log('--- Downloading Sites Images ---');
  for (const item of SITES_IMAGES) {
    const dest = path.join(process.cwd(), 'public', 'Sites', item.filename);
    if (!fs.existsSync(dest)) {
      const ok = await download(item.url, dest);
      if (!ok && item.fallbackUrl) {
        await download(item.fallbackUrl, dest);
      }
    } else {
      console.log(`- Already exists: ${item.filename}`);
    }
  }

  console.log('--- Downloading Cuisine Images ---');
  for (const item of CUISINE_IMAGES) {
    const dest = path.join(process.cwd(), 'public', 'Cuisine', item.filename);
    if (!fs.existsSync(dest)) {
      await download(item.url, dest);
    } else {
      console.log(`- Already exists: ${item.filename}`);
    }
  }

  console.log('Done!');
}

run();
