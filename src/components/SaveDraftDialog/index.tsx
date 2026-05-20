// src/components/SaveDraftDialog/index.tsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, Button, Paragraph } from 'react-native-paper';
import { saveDraft } from '../../utils/storageService';

interface SaveDraftDialogProps {
  visible: boolean;
  documentType: 'jobApplication' | 'cv' | 'resignation';
  data: any;
  onDismiss: () => void;
  onSaved: (draftId: string) => void;
}

const SaveDraftDialog: React.FC<SaveDraftDialogProps> = ({
  visible,
  documentType,
  data,
  onDismiss,
  onSaved,
}) => {
  const [draftTitle, setDraftTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Function to handle saving the draft
  const handleSave = async () => {
    if (!draftTitle.trim()) {
      setError('Judul draft wajib diisi');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const draftId = await saveDraft(documentType, data, draftTitle);
      onSaved(draftId);
      setDraftTitle('');
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Gagal menyimpan draft. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  // Function to handle dismissing the dialog
  const handleDismiss = () => {
    setDraftTitle('');
    setError('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>Simpan Draft</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            Berikan judul untuk draft dokumen ini:
          </Paragraph>
          <TextInput
            label="Judul Draft"
            value={draftTitle}
            onChangeText={setDraftTitle}
            mode="outlined"
            style={styles.input}
            error={!!error}
          />
          {error ? <Paragraph style={styles.errorText}>{error}</Paragraph> : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>Batal</Button>
          <Button onPress={handleSave} loading={saving} disabled={saving}>
            Simpan
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  input: {
    marginTop: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

export default SaveDraftDialog;