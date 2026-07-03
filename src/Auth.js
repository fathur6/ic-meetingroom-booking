var Auth = {
  validateKey: function (key) {
    return true;
  },

  getAdminList: function () {
    var sheet = SheetService._getSheet(CONFIG.SHEET_ADMINS);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var admins = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) admins.push({ email: String(data[i][0]).trim(), name: String(data[i][1] || '').trim(), role: String(data[i][2] || '').trim() });
    }
    return admins;
  }
};
