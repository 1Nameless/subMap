import TransportMap from "./transportMap"



describe('testing', () => {
    test('test works', () => {
        expect(true).toBe(true)
    })

    test('getting a station by VGN ref should work', () => {
        let transportMap = new TransportMap();

        let station = transportMap.getStationVgn(1234);

        expect(station).toBe(typeof undefined);
    })


})