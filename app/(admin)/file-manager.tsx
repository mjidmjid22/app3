import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modificationTime?: number;
}

const FileManagerScreen = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(FileSystem.documentDirectory || '');

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const fileList = await FileSystem.readDirectoryAsync(currentPath);
      
      const fileItems: FileItem[] = await Promise.all(
        fileList.map(async (fileName) => {
          const filePath = `${currentPath}${fileName}`;
          try {
            const info = await FileSystem.getInfoAsync(filePath);
            return {
              name: fileName,
              type: info.isDirectory ? 'directory' : 'file',
              size: info.size,
              modificationTime: info.modificationTime
            };
          } catch (error) {
            return {
              name: fileName,
              type: 'file'
            };
          }
        })
      );

      setFiles(fileItems);
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert(t('common.error') || 'Error', t('fileManager.failedToLoad') || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFilePress = (file: FileItem) => {
    if (file.type === 'directory') {
      setCurrentPath(`${currentPath}${file.name}/`);
    } else {
      Alert.alert(
        t('fileManager.fileOptions') || 'File Options',
        t('fileManager.fileOptionsMessage', { fileName: file.name }) || `What would you like to do with ${file.name}?`,
        [
          {
            text: t('common.delete') || 'Delete',
            style: 'destructive',
            onPress: () => deleteFile(file.name)
          },
          {
            text: t('fileManager.share') || 'Share',
            onPress: () => shareFile(file.name)
          },
          {
            text: t('common.cancel') || 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const deleteFile = async (fileName: string) => {
    try {
      const filePath = `${currentPath}${fileName}`;
      await FileSystem.deleteAsync(filePath);
      Alert.alert(t('common.success') || 'Success', t('fileManager.fileDeleted') || 'File deleted successfully');
      loadFiles();
    } catch (error) {
      Alert.alert(t('common.error') || 'Error', t('fileManager.failedToDelete') || 'Failed to delete file');
    }
  };

  const shareFile = async (fileName: string) => {
    Alert.alert(t('fileManager.share') || 'Share', t('fileManager.shareMessage', { fileName }) || `Sharing functionality for ${fileName} will be implemented soon.`);
  };

  const goBack = () => {
    const pathParts = currentPath.split('/').filter(part => part !== '');
    if (pathParts.length > 1) {
      pathParts.pop();
      setCurrentPath('/' + pathParts.join('/') + '/');
    }
  };

  const renderFileItem = ({ item }: { item: FileItem }) => (
    <TouchableOpacity style={styles.fileItem} onPress={() => handleFilePress(item)}>
      <View style={styles.fileInfo}>
        <Ionicons 
          name={item.type === 'directory' ? 'folder' : 'document'} 
          size={24} 
          color={item.type === 'directory' ? '#FFD700' : '#4A90E2'} 
        />
        <View style={styles.fileDetails}>
          <Text style={styles.fileName}>{item.name}</Text>
          {item.size && (
            <Text style={styles.fileSize}>
              {(item.size / 1024).toFixed(1)} KB
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.custom.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>Mantaevert</Text>
        <Text style={styles.title}>{t('fileManager.title') || 'File Manager'}</Text>
        <Text style={styles.subtitle}>{t('fileManager.subtitle') || 'Manage System Files'}</Text>
      </View>

      {/* Current Path */}
      <View style={styles.pathContainer}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.custom.primary} />
        </TouchableOpacity>
        <Text style={styles.currentPath}>{currentPath}</Text>
      </View>

      {/* Files List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.custom.secondary} />
          <Text style={styles.loadingText}>{t('fileManager.loadingFiles') || 'Loading files...'}</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={renderFileItem}
          style={styles.filesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open" size={64} color={Colors.custom.secondary} />
              <Text style={styles.emptyText}>{t('fileManager.noFiles') || 'No files found'}</Text>
              <Text style={styles.emptySubText}>{t('fileManager.directoryEmpty') || 'This directory is empty'}</Text>
            </View>
          }
        />
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={loadFiles}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{t('fileManager.refresh') || 'Refresh'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.custom.background,
  },
  header: {
    backgroundColor: Colors.custom.accent,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.custom.secondary,
    textAlign: 'center',
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.custom.accent,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 10,
  },
  currentPath: {
    flex: 1,
    fontSize: 14,
    color: Colors.custom.primary,
  },
  filesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.custom.accent,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.custom.primary,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.custom.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.custom.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.custom.primary,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.custom.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.custom.secondary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default FileManagerScreen;