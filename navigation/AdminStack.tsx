import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AddWorkerScreen from '../screens/Admin/AddworkerScreen';
import ViewWorkersScreen from '../screens/Admin/ViewWorkersScreen';
import CheckoutWorkerScreen from '../screens/Admin/CheckoutWorkerScreen';
import ReceiptHistoryScreen from '../screens/Admin/ReceiptHistoryScreen';
import DocumentTemplatesScreen from '../screens/Admin/DocumentTemplatesScreen';
import CreateDocumentScreen from '../screens/Admin/CreateDocumentScreen';
import SettingsScreen from '../screens/Admin/SettingsScreen';
import SystemReportsScreen from '../screens/Admin/SystemReports';
import PDFViewerScreen from '../screens/PDFViewerScreen';

const Stack = createStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddWorker" component={AddWorkerScreen} />
      <Stack.Screen name="ViewWorkers" component={ViewWorkersScreen} />
      <Stack.Screen name="CheckoutWorker" component={CheckoutWorkerScreen} />
      <Stack.Screen name="ReceiptHistory" component={ReceiptHistoryScreen} />
      <Stack.Screen name="DocumentTemplates" component={DocumentTemplatesScreen} />
      <Stack.Screen name="CreateDocumentScreen" component={CreateDocumentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SystemReports" component={SystemReportsScreen} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
    </Stack.Navigator>
  );
}