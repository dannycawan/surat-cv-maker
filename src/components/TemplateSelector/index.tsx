// src/components/TemplateSelector/index.tsx
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Title, RadioButton } from 'react-native-paper';

// Define template types and interfaces
export interface Template {
  id: string;
  name: string;
  preview: any; // This would be an image asset
  description: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate
}) => {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Pilih Template</Title>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            onPress={() => onSelectTemplate(template.id)}
            style={styles.templateContainer}
          >
            <Card 
              style={[
                styles.templateCard,
                selectedTemplate === template.id && styles.selectedCard
              ]}
            >
              <Card.Cover 
                source={template.preview} 
                style={styles.templatePreview}
              />
              <Card.Content>
                <View style={styles.templateTitleContainer}>
                  <RadioButton
                    value={template.id}
                    status={selectedTemplate === template.id ? 'checked' : 'unchecked'}
                    onPress={() => onSelectTemplate(template.id)}
                  />
                  <Text style={styles.templateName}>{template.name}</Text>
                </View>
                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  templateContainer: {
    width: 200,
    marginRight: 12,
  },
  templateCard: {
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  templatePreview: {
    height: 120,
    resizeMode: 'cover',
  },
  templateTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  templateName: {
    fontWeight: 'bold',
    flexShrink: 1,
  },
  templateDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default TemplateSelector;