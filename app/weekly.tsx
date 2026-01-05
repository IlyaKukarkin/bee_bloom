import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from 'tinybase/ui-react';
import { Surface, Title, Body, Button } from '../src/components/ui';
import { getWeeklyDataByGroup, getWeekDaysFromMonday, HabitWithWeeklyChecks } from '../src/store/selectors';
import { useTheme } from '../src/lib/theme';

export default function Weekly() {
  const router = useRouter();
  const store = useStore();
  const theme = useTheme();
  const [groupedData, setGroupedData] = useState<Map<string, HabitWithWeeklyChecks[]>>(new Map());
  const dates = getWeekDaysFromMonday();

  const loadData = () => {
    if (!store) return;
    const data = getWeeklyDataByGroup(store);
    setGroupedData(data);
  };

  useEffect(() => {
    loadData();

    if (!store) return;
    const listenerId = store.addTablesListener(() => {
      loadData();
    });

    return () => {
      store.delListener(listenerId);
    };
  }, [store]);

  // Format date to day abbreviation (e.g., "Mon", "Tue")
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
  };

  const groups = Array.from(groupedData.entries()).sort((a, b) => {
    if (a[0] === 'Other') return 1;
    if (b[0] === 'Other') return -1;
    return a[0].localeCompare(b[0]);
  });

  if (groups.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <Surface style={styles.card}>
          <Title>Weekly Review</Title>
          <Body muted>Add habits to see your weekly progress.</Body>
          <Button onPress={() => router.push('/habit/new' as any)}>Add a habit</Button>
        </Surface>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Title>Weekly</Title>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Day headers */}
        <View style={styles.dayHeaders}>
          <View style={styles.habitNameColumn} />
          {dates.map((date) => (
            <View key={date} style={styles.dayColumn}>
              <Body muted style={styles.dayLabel}>{formatDay(date)}</Body>
            </View>
          ))}
        </View>

        {/* Grouped habits */}
        {groups.map(([groupName, habits]) => (
          <View key={groupName} style={styles.groupSection}>
            <Body style={styles.groupTitle}>{groupName}</Body>
            {habits.map((item) => (
              <Surface key={item.habit.id} style={styles.habitRow}>
                <View style={styles.habitNameColumn}>
                  <View style={[styles.colorDot, { backgroundColor: item.habit.color }]} />
                  <Body style={styles.habitName}>{item.habit.title}</Body>
                </View>
                <View style={styles.checksRow}>
                  {item.checks.map((check, idx) => (
                    <View key={idx} style={styles.dayColumn}>
                      <View
                        style={[
                          styles.checkDot,
                          check.completed && { 
                            backgroundColor: item.habit.color,
                            opacity: 1,
                          },
                        ]}
                      />
                    </View>
                  ))}
                </View>
              </Surface>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f5f2',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  card: {
    gap: 12,
    margin: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  habitNameColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  checksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayColumn: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  groupSection: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#4d5b4d',
    paddingBottom: 4,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  habitName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d8e2d8',
    opacity: 0.3,
  },
});
