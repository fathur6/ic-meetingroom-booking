var Auth = {
  validateKey: function (key) {
    var settings = SheetService.getSettings();
    return key && key === settings.adminKey;
  },

  getAdminList: function () {
    var sheet = SheetService._getSheet(CONFIG.SHEET_ADMINS);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var admins = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) admins.push({ email: String(data[i][0]).trim(), role: data[i][1] || '' });
    }
    return admins;
  }
};
