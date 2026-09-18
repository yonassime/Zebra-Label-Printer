# ILRI Zebra Label Printer

Run `npm start`, then open `http://localhost:3000`.

The app selects the printer automatically:

- **Field Label:** `172.27.8.31:9100`; paste `accno,lotno,taxon,duplicates`. Labels print four across.
- **Distribution Label:** `172.27.8.45:9100`; paste `accno,lotno,doi,taxon,weightsent,productionsite,yearharvest`. Each row prints one MTS label.

For Distribution Labels, the upper-left QR code contains only the DOI. The printed label includes ILRI GENEBANK, In trust, DOI, ILRI number, Lot number, taxon, `Produced: Production Site Year Harvest`, and Weight Sent. Its ZPL coordinates are based on the supplied FoxPro label program and physical-label image.
