import { addPlugin } from 'react-native-flipper';

function bootstrapPlugin() {
    return new Promise((resolve) => {
        addPlugin({
            getId: () => 'async-storage-flipper',
            onConnect: (connection) => {
                return resolve(connection);
            },
            onDisconnect: () => {},
            runInBackground: () => true,
        });
    });
}

function flipping(storage) {
    bootstrapPlugin()
        .then((currentConnection) => {
            if (currentConnection) {
                storage.getAllKeys().then((keys) => {
                    storage.multiGet(keys).then((data) => {
                        data.map((_, i, store) => {
                            let key = store[i][0];
                            let value = store[i][1];
                            if (
                                (value.startsWith('{') &&
                                    value.endsWith('}')) ||
                                (value.startsWith('[') && value.endsWith(']'))
                            ) {
                                value = JSON.parse(value);
                            }
                            currentConnection.send('newElement', {
                                key,
                                value,
                                id: key + i,
                            });
                        });
                    });
                });
            }
        })
        .catch((err) => console.error(err));
}
