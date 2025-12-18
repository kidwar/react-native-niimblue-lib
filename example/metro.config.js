const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

/**
 * Metro configuration for monorepo development
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Watch parent directory for library source changes
  watchFolders: [workspaceRoot],
  
  resolver: {
    // Prioritize example's node_modules to avoid duplicate native modules
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    
    // Block ONLY peer dependencies from parent to prevent duplicate native modules
    // Allow other dependencies (crc-32, etc.) to load from parent
    blockList: [
      new RegExp(`${path.resolve(workspaceRoot, 'node_modules/react-native-ble-plx').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`),
      new RegExp(`${path.resolve(workspaceRoot, 'node_modules/@shopify/react-native-skia').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
