const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 420, minHeight: 600,
    backgroundColor: "#edf0f3",
    title: "Reçus Scolaires",
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "index.html"));
  // Les liens externes (WhatsApp, Instagram) s'ouvrent dans le navigateur
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (/^https:\/\//.test(url)) { e.preventDefault(); shell.openExternal(url); }
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
