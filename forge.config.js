module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icons/icon' // no file extension required
  },
 
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
        iconUrl: 'https://lowcode-2gexp0oub13a679d-1253647391.tcloudbaseapp.com/resources/2023-12/lowcode-1522476',
        // The ICO file to use as the icon for the generated Setup.exe
        setupIcon: './icons/icon.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        icon: './icons/icon.icns'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],

  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'uning',
          name: 'ocrjt'
        },
        prerelease: false,
        draft: true
      }
    }
  ]
};
