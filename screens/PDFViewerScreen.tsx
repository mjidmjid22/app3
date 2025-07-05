import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';

export default function PDFViewerScreen({ route }: any) {
    const { uri } = route.params;
    const [pdfData, setPdfData] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadPdf = async () => {
            try {
                const content = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                setPdfData(`data:application/pdf;base64,${content}`);
            } catch (error) {
                console.error('Error reading PDF file:', error);
            }
        };

        loadPdf();
    }, [uri]);

    return (
        <View style={styles.container}>
            {pdfData ? (
                <WebView
                    originWhitelist={['*']}
                    source={{ html: `<iframe src="${pdfData}" style="width:100%;height:100%;"></iframe>` }}
                    style={styles.pdf}
                />
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 25,
    },
    pdf: {
        flex:1,
        width:Dimensions.get('window').width,
        height:Dimensions.get('window').height,
    }
});