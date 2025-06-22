import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { KpiCategory, KPI } from '../../types';
import { obtenerKpis } from '../../services/kpiService';
import IndicadorCarga from '../../components/Common/LoadingIndicator';
import MensajeError from '../../components/Common/ErrorMessage';
import Colors, { ChartColors } from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';


export default function CategoryDetailScreen() {
  const { category } = useLocalSearchParams<{ category: KpiCategory }>();
  const [filteredKpis, setFilteredKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await obtenerKpis();
        const kpis = response.results;
        
        // Filter by category first
        const categoryKpis = kpis.filter(kpi => kpi.category === category);
        
        // Get most recent KPI per unique name
        const uniqueKpis = getMostRecentKpisByName(categoryKpis);
        
        setFilteredKpis(uniqueKpis);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los KPIs');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category]);

  const prepareChartData = (kpis: KPI[]) => {
  return {
    labels: kpis.map(kpi => formatChartLabel(kpi.name)),
    datasets: [{
      data: kpis.map(kpi => Number(kpi.value)),
      // Assign different colors to each bar
      colors: kpis.map((_, index) => (opacity = 1) => {
        const colorIndex = index % ChartColors.length;
        return ChartColors[colorIndex];
      })
    }]
  };
};

  // Helper function to get most recent KPI per name
  const getMostRecentKpisByName = (kpis: KPI[]): KPI[] => {
    const kpisByName = new Map<string, KPI>();
    
    kpis.forEach(kpi => {
      const existing = kpisByName.get(kpi.name);
      if (!existing || new Date(kpi.last_updated) > new Date(existing.last_updated)) {
        kpisByName.set(kpi.name, kpi);
      }
    });
    
    return Array.from(kpisByName.values());
  };

  const formatChartLabel = (label: string) => {
  const maxLength = screenWidth > 400 ? 12 : 8; // More characters on wider screens
  if (label.length > maxLength) {
    return `${label.substring(0, maxLength)}...`;
  }
  return label;
};

  const renderKpiItem = ({ item }: { item: KPI }) => (
    <View style={styles.kpiItem}>
      <Text style={styles.kpiName}>{item.name}</Text>
      <Text style={styles.kpiValue}>
        {item.value} {item.unit}
      </Text>
      <Text style={styles.kpiDate}>
        Actualizado: {new Date(item.last_updated).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return <IndicadorCarga tamaño="large" />;
  }

  if (error) {
    return <MensajeError mensaje={error} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KPIs de {category}</Text>


{filteredKpis.length > 0 && (
 <View style={styles.chartOuterContainer}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chartScrollContainer}
    >
        <View style={styles.chartWrapper}>
    <BarChart 
      data={prepareChartData(filteredKpis)}
      width={Math.max(
          screenWidth * 0.9, // Base width
          filteredKpis.length * 60 // Dynamic width for many items
          )}
      height={220}      
      yAxisLabel="" // Optional prefix for Y values
      yAxisSuffix={` ${filteredKpis[0]?.unit || ''}`}
      chartConfig={{
        backgroundColor: Colors.white,
        backgroundGradientFrom: Colors.white,
        backgroundGradientTo: Colors.white,
        decimalPlaces: 2,
        color: (opacity = 1) => Colors.primary,
        labelColor: (opacity = 1) => Colors.text,
        style: {
          borderRadius: Layout.borderRadius.medium
        },
       
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        fillShadowGradientOpacity: 0.8,
        barPercentage:1,// Slightly wider bars


        propsForLabels: {
        fontSize: 10,
        rotation: screenWidth < 400 ? -60 : -45, // Steeper angle on small screens
        translateY: screenWidth < 400 ? 16 : 10, // More vertical adjustment on small screens
        translateX: 5, // Small horizontal adjustment
        },
        formatYLabel: (value) => {
          if (Number(value) >= 1000000) return `${(Number(value) / 1000000).toFixed(1)}M`;
          if (Number(value) >= 1000) return `${(Number(value) / 1000).toFixed(1)}k`;
          return Number(value).toFixed(1);
        }
      }}
      style={{
        // marginVertical: Layout.spacing.small,
        // borderRadius: Layout.borderRadius.medium
      }}

      flatColor={true} // Makes colors more vibrant
      showValuesOnTopOfBars // Optional: shows values above bars
      fromZero
      showBarTops
      withCustomBarColorFromData
      verticalLabelRotation={-45}
      horizontalLabelRotation={0}
      segments={4} // Better Y-axis granularity
      
    />
    <View style={styles.labelPadding} />
    </View>
      </ScrollView>

  </View>
)}
      
      <FlatList
        data={filteredKpis}
        renderItem={renderKpiItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay KPIs en esta categoría</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({

     chartOuterContainer: {
  maxHeight: '40%',
  minHeight: 240, // Increased from 200
//   marginBottom: Layout.spacing.large, // Increased margin
//   paddingBottom: 40, // Add space for labels
  overflow: 'visible', // Allow labels to render outside
  },
  chartScrollContainer: {
    paddingVertical: 8,
  },
  chartStyle: {
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.cardBackground,
  },
  chartWrapper: {
  position: 'relative',
},

    chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.small,
    marginBottom: Layout.spacing.medium,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden', // Prevents chart from bleeding outside container
  },
  chartLabel: {
    textAlign: 'center',
    fontSize: Layout.fontSize.caption,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.small,
  },
  labelPadding: {
  height: 40,
  width: '100%',
  },
  container: {
    flex: 1,
    padding: Layout.spacing.medium,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Layout.fontSize.title,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.large,
  },
  listContent: {
    paddingBottom: Layout.spacing.large,
  },
  kpiItem: {
    backgroundColor: Colors.cardBackground,
    padding: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.small,
  },
  kpiName: {
    fontSize: Layout.fontSize.subheading,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.tiny,
  },
  kpiValue: {
    fontSize: Layout.fontSize.body,
    color: Colors.primary,
    marginBottom: Layout.spacing.tiny,
  },
  kpiDate: {
    fontSize: Layout.fontSize.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Layout.spacing.large,
  },
});