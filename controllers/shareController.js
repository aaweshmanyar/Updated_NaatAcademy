const { getKalaamById } = require('../services/kalaamService'); // Create or import this DB logic

exports.shareKalaamController = async (req, res) => {
  const { id } = req.params;

  try {
    const kalaam = await getKalaamById(id); // Replace this with your actual DB function

    if (!kalaam) return res.status(404).send('Kalaam not found');

    const writer = kalaam.WriterName || "نامعلوم مصنف";

    res.send(`
      <!DOCTYPE html>
      <html lang="ur">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${kalaam.Title}</title>
        <meta name="description" content="${kalaam.Title} by ${writer} on Naatacademy.com" />
        <meta property="og:title" content="${kalaam.Title}" />
        <meta property="og:description" content="by ${writer} on Naatacademy.com" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://naatacademy.com/share/kalaam/${id}" />
        <meta property="og:site_name" content="Naatacademy.com" />
        <style>
          body { font-family: 'Noto Nastaliq Urdu', serif; text-align: right; direction: rtl; margin: 2em; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>${kalaam.Title}</h1>
          <p><strong>مصنف:</strong> ${writer}</p>
          <p><em>مزید کلام کے لیے وزٹ کریں:</em> <a href="https://naatacademy.com" target="_blank">Naatacademy.com</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error in shareKalaamController:', err);
    res.status(500).send('Internal Server Error');
  }
};
