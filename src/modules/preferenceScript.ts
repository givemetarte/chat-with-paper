import { config } from "../../package.json";
import { getString } from "../utils/locale";

export async function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/chrome/content/preferences.xul onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
      columns: [
        {
          dataKey: "title",
          label: getString("prefs-table-title"),
          fixedWidth: true,
          width: 100,
        },
        {
          dataKey: "detail",
          label: getString("prefs-table-detail"),
        },
      ],
      rows: []
    };
  } else {
    addon.data.prefs.window = _window;
  }
  bindPrefEvents();
}

function bindPrefEvents() {
  const inputIds = ['api', 'base-url'];

  inputIds.forEach(id => {
    addon.data
      .prefs!.window.document.querySelector(
        `#zotero-prefpane-${config.addonRef}-input-${id}`
      )
      ?.addEventListener("change", (e) => {
        addon.data.prefs!.window.alert(
          `Your API key has been successfully registered!`
        );
      });
  });
}
