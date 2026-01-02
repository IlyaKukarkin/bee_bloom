import React from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTable, useRowIds, useStore } from 'tinybase/ui-react';
import { Surface, Title, Body, Button } from '../src/components/ui';
import { AnimatedRow, AnimatedCheckbox } from '../src/components/animations';
import { copy } from '../src/lib/copy';
import { toggleDailyCheck } from '../src/store/checks';
import { todayKey } from '../src/lib/dates';
import { HabitRow } from '../src/store/types';
import { useTheme } from '../src/lib/theme';

type HabitWithCheck = HabitRow & { isChecked: boolean };

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const store = useStore();
  const today = todayKey();
  
  // Use Tinybase hooks to reactively get data
  const habitsTable = useTable('habits') as Record<string, HabitRow>;
  const checksTable = useTable('checks');
  const habitIds = useRowIds('habits');

  // Compute habits with checks
  const habits: HabitWithCheck[] = habitIds
    .map((id) => {
      const habit = habitsTable[id];
      if (!habit || habit.deletedAt) return null;
      const checkId = `${id}:${today}`;
      const check = checksTable?.[checkId];
      return { ...habit, isChecked: check?.completed || false };
    })
    .filter((h): h is HabitWithCheck => h !== null)
    .sort((a, b) => {
      const groupA = a.group || '';
      const groupB = b.group || '';
      if (groupA !== groupB) {
        return groupA.localeCompare(groupB);
      }
      return a.createdAt.localeCompare(b.createdAt);
    });

  const handleToggle = (habitId: string) => {
    if (!store) return;
    toggleDailyCheck(store, habitId, today);
  };

  const handleEdit = (habitId: string) => {
    router.push({ pathname: '/habit/[id]' as any, params: { id: habitId } });
  };

  if (habits.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <Surface style={styles.card}>
          <Title>{copy.emptyTodayTitle}</Title>
          <Body muted>{copy.emptyTodayBody}</Body>
          <Button onPress={() => router.push('/habit/new' as any)}>Add a habit</Button>
        </Surface>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Title>Today</Title>
        <Button onPress={() => router.push('/habit/new' as any)} style={styles.addButton}>
          + Add
        </Button>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          // Show group header if first item or different group from previous
          const showGroupHeader = index === 0 || 
            (habits[index - 1]?.group || '') !== (item.group || '');
          
          return (
            <AnimatedRow delay={index * 50}>
              {showGroupHeader && item.group && (
                <Body muted style={styles.groupHeader}>{item.group}</Body>
              )}
              <Surface style={styles.habitRow}>
                <Pressable
                  style={styles.habitContent}
                  onPress={() => handleEdit(item.id)}
                >
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <View style={styles.habitText}>
                    <Body style={styles.habitTitle}>{item.title}</Body>
                    {item.description && <Body muted style={styles.habitDescription}>{item.description}</Body>}
                  </View>
                </Pressable>
                <AnimatedCheckbox isChecked={item.isChecked}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      { borderColor: item.color },
                      item.isChecked && { backgroundColor: item.color },
                    ]}
                    onPress={() => handleToggle(item.id)}
                    accessibilityLabel={item.isChecked ? 'Uncheck' : 'Check'}
                  >
                    {item.isChecked && <Body style={styles.checkmark}>✓</Body>}
                  </TouchableOpacity>
                </AnimatedCheckbox>
              </Surface>
            </AnimatedRow>
          );
        }}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f5f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    gap: 12,
    margin: 16,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  habitContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  habitText: {
    flex: 1,
    gap: 4,
  },
  habitTitle: {
    fontWeight: '600',
  },
  habitDescription: {
    fontSize: 14,
  },
  groupHeader: {
    fontSize: 14,
    fontWeight: '600',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
