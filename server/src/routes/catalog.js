import { v4 as uuid } from 'uuid';

export function registerCatalogRoutes(app, deps) {
  const { readDB, writeDB, adminOnly } = deps;

  app.get('/api/products', async (req, res) => {
    const db = await readDB();
    const { category, q } = req.query;

    let products = db.products.filter(
      (product) => product.status === 'active' || req.query.admin === 'true'
    );

    if (category && category !== 'all') {
      products = products.filter((product) => product.category === category);
    }

    if (q) {
      products = products.filter((product) =>
        `${product.title} ${product.game} ${product.amount}`
          .toLowerCase()
          .includes(String(q).toLowerCase())
      );
    }

    res.json(products);
  });

  app.post('/api/products', adminOnly, async (req, res) => {
    const db = await readDB();
    const product = {
      id: uuid(),
      status: 'active',
      featured: false,
      ...req.body,
    };

    db.products.unshift(product);
    await writeDB(db);
    res.status(201).json(product);
  });

  app.put('/api/products/:id', adminOnly, async (req, res) => {
    const db = await readDB();
    db.products = db.products.map((product) =>
      product.id === req.params.id ? { ...product, ...req.body } : product
    );

    await writeDB(db);
    res.json(db.products.find((product) => product.id === req.params.id));
  });

  app.delete('/api/products/:id', adminOnly, async (req, res) => {
    const db = await readDB();
    db.products = db.products.filter((product) => product.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
  });
}
