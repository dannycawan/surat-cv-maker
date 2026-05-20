import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Text, Button, IconButton, Dialog, Portal, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { DraftItem, getDraftList, deleteDraft } from '../../utils/storageService';

interface DraftsListProps {
  documentType: 'jobApplication' | 'cv' | 'resignation';
  onLoadDraft: (data: any) => void;
  containerStyle?: object; // Add optional container style prop
}

const DraftsList: React.FC<DraftsListProps> = ({ documentType, onLoadDraft, containerStyle }) => {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Load drafts when component mounts
  useEffect(() => {
    loadDrafts();
  }, []);

  // Function to load drafts
  const loadDrafts = async () => {
    setLoading(true);
    try {
      const draftsList = await getDraftList(documentType);
      setDrafts(draftsList.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle draft selection
  const handleDraftSelect = (draft: DraftItem) => {
    onLoadDraft(draft.data);
  };

  // Function to handle draft preview
  const handleDraftPreview = (draft: DraftItem) => {
    navigation.navigate('Preview', {
      documentType: draft.documentType,
      data: draft.data
    });
  };

  // Function to confirm draft deletion
  const confirmDelete = (draftId: string) => {
    setSelectedDraftId(draftId);
    setDeleteDialogVisible(true);
  };

  // Function to handle draft deletion
  const handleDeleteDraft = async () => {
    if (selectedDraftId) {
      try {
        await deleteDraft(documentType, selectedDraftId);
        setDrafts(drafts.filter(draft => draft.id !== selectedDraftId));
        setDeleteDialogVisible(false);
      } catch (error) {
        console.error('Error deleting draft:', error);
        Alert.alert('Error', 'Failed to delete draft');
      }
    }
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If there are no drafts, show a message
  if (drafts.length === 0 && !loading) {
    return (
      <View style={[styles.emptyContainer, containerStyle]}>
        <Text style={styles.emptyText}>Belum ada draft tersimpan</Text>
      </View>
    );
  }

  // Render each draft as a card without using a FlatList
  return (
    <View style={[styles.container, containerStyle]}>
      <Title style={styles.title}>Draft Tersimpan</Title>
      
      {/* Render drafts directly instead of using FlatList */}
      <View style={styles.listContent}>
        {drafts.map((item) => (
          <Card key={item.id} style={styles.draftCard}>
            <Card.Content>
              <View style={styles.draftHeader}>
                <Title style={styles.draftTitle}>{item.title}</Title>
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => confirmDelete(item.id)}
                />
              </View>
              <Text style={styles.draftDate}>
                Terakhir diubah: {formatDate(item.timestamp)}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleDraftSelect(item)}>Muat</Button>
              <Button onPress={() => handleDraftPreview(item)}>Pratinjau</Button>
            </Card.Actions>
          </Card>
        ))}
      </View>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Hapus Draft</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Apakah Anda yakin ingin menghapus draft ini?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Batal</Button>
            <Button onPress={handleDeleteDraft}>Hapus</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  listContent: {
    paddingBottom: 8,
  },
  draftCard: {
    marginBottom: 8,
    marginHorizontal: 8,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftTitle: {
    fontSize: 16,
    flex: 1,
  },
  draftDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default DraftsList;