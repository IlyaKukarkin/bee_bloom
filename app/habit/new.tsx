import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from 'tinybase/ui-react';
import { Surface, Title, Body, Button } from '../../src/components/ui';
import { createHabit } from '../../src/store/habits';
import { useTheme } from '../../src/lib/theme';

const COLORS = [
  { name: 'Green', value: '#3c7c5a' },
  { name: 'Sage', value: '#8fb89e' },
  { name: 'Warm', value: '#d88c4a' },
  { name: 'Blue', value: '#7a9cb8' },
  { name: 'Taupe', value: '#b8a89e' },
];

export default function NewHabit() {
  const router = useRouter();
  const store = useStore();
  const theme = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [group, setGroup] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setColor(COLORS[0].value);
    setGroup('');
  };

  const handleSave = () => {
    if (!title.trim() || !store) {
      return;
    }

    createHabit(store, {
      title,
      description: description || null,
      color,
      group: group || null,
    });

    resetForm();
    router.back();
  };

  const handleCancel = () => {
    resetForm();
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Surface style={styles.card}>
          <Title>New Habit</Title>

          <View style={styles.field}>
            <Body style={styles.label}>Title</Body>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Daily walk"
              placeholderTextColor={theme.colors.subtext}
              maxLength={80}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Body style={styles.label}>Description (optional)</Body>
            <TextInput
              style={[styles.input, styles.multiline, { borderColor: theme.colors.border }]}
              value={description}
              onChangeText={setDescription}
              placeholder="A gentle stroll around the block"
              placeholderTextColor={theme.colors.subtext}
              maxLength={200}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Body style={styles.label}>Group (optional)</Body>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border }]}
              value={group}
              onChangeText={setGroup}
              placeholder="Morning routine"
              placeholderTextColor={theme.colors.subtext}
              maxLength={40}
            />
          </View>

          <View style={styles.field}>
            <Body style={styles.label}>Color</Body>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.colorChip,
                    { backgroundColor: c.value },
                    color === c.value && styles.colorChipSelected,
                  ]}
                  onPress={() => setColor(c.value)}
                  accessibilityLabel={c.name}
                />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Button onPress={handleCancel} variant="secondary" style={styles.buttonSecondary}>
              Cancel
            </Button>
            <Button onPress={handleSave} disabled={!title.trim()}>
              Save
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f5f2',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorChipSelected: {
    borderColor: '#1f2d1f',
    borderWidth: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  buttonSecondary: {
    flex: 1,
  },
});
