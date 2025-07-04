import React from 'react';
import PDFViewerScreen from '../screens/PDFViewerScreen';
import { useLocalSearchParams } from 'expo-router';

const PDFViewerPage = () => {
  const { uri } = useLocalSearchParams();

  const route = {
    params: {
      uri: uri as string,
    },
  };

  return <PDFViewerScreen route={route} />;
};

export default PDFViewerPage;
