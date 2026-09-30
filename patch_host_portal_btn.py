with open('src/components/HostPortalView.tsx', 'r') as f:
    content = f.read()

btn_find = """            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold shadow-[0_1px_3px_rgba(10,111,168,0.25)] cursor-pointer transition-all"
            >
              Save Configuration
            </button>"""

btn_replace = """            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold shadow-[0_1px_3px_rgba(10,111,168,0.25)] cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Saving...</>
              ) : (
                'Save Configuration'
              )}
            </button>"""

content = content.replace(btn_find, btn_replace)

with open('src/components/HostPortalView.tsx', 'w') as f:
    f.write(content)
