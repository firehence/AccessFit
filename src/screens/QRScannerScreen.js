import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scannedData, setScannedData] = useState(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScannedData(data);
  };

  if (hasPermission === null) return <Text>QR kod erişimi bekleniyor...</Text>;
  if (hasPermission === false) return <Text>Erişim reddedildi</Text>;

  return (
    <View>
      <BarCodeScanner
        onBarCodeScanned={scannedData ? undefined : handleBarCodeScanned}
        style={{ height: 400, width: 400 }}
      />
      {scannedData && <Text>QR Data: {scannedData}</Text>}
    </View>
  );
};

export default QRScannerScreen;
