function doGet() {
  const sh = SpreadsheetApp.getActive().getSheetByName('data');
  const v = sh ? sh.getRange('A1').getValue() : '';
  let o = v ? JSON.parse(v) : null;
  if (Array.isArray(o)) o = {at: 0, days: o};
  return ContentService.createTextOutput(JSON.stringify(o || {at: 0, days: null}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActive();
  const body = JSON.parse(e.postData.contents);
  const days = body.days;
  const d = ss.getSheetByName('data') || ss.insertSheet('data');
  d.getRange('A1').setValue(JSON.stringify(body));
  const s = ss.getSheetByName('Itinerary') || ss.insertSheet('Itinerary');
  s.clear();
  const rows = [['Day', 'Date', 'Location', 'Time', 'Activity', 'Places', 'Backup', 'Notes']];
  days.forEach(x => x.items.forEach(i =>
    rows.push([x.d, x.date, x.loc, i.t, i.x, i.p.join(', '), i.b ? 'Yes' : '', i.n || ''])));
  s.getRange(1, 1, rows.length, 8).setNumberFormat('@').setValues(rows);
  const B = body.budget || [];
  const bs = ss.getSheetByName('Budget') || ss.insertSheet('Budget');
  bs.clear();
  const br = [['Date', 'Category', 'Description', 'Amount (IDR)']];
  B.forEach(e => br.push([e.d, e.c, e.x, e.a]));
  br.push(['', '', '', ''], ['Totals by category', '', '', '']);
  const t = {};
  B.forEach(e => t[e.c] = (t[e.c] || 0) + e.a);
  Object.keys(t).forEach(k => br.push([k, '', '', t[k]]));
  br.push(['Total', '', '', B.reduce((a, e) => a + e.a, 0)]);
  bs.getRange(1, 1, br.length, 3).setNumberFormat('@');
  bs.getRange(1, 1, br.length, 4).setValues(br);
  return ContentService.createTextOutput(JSON.stringify({ok: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
