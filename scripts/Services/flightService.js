let flights = (() => {
    function GetPublishedFlights() {
        let endpoint = 'flights?query={"isPublished":"true"}';
        return remote.get('appdata', endpoint, 'kinvey');
    }

    function Add(destination, origin, departure, time, seats, cost, image, isPublished) {

        let obj = {destination, origin, departure, time, seats, cost, image, isPublished};
        let endpoint = 'flights';
        return remote.post('appdata', endpoint, 'kinvey', obj);
    }

    function GetSingleById(id) {
        let endpoint = `flights/${id}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }

    function Edit(destination, origin, departure, time, seats, cost, image, isPublished, flightId) {
        let obj = {destination, origin, departure, time, seats, cost, image, isPublished};
        let endpoint = `flights/${flightId}`;
        return remote.update('appdata', endpoint, 'kinvey', obj);
    }

    function GetMyFlights(userId) {
        let endpoint = `flights?query={"_acl.creator":"${userId}"}`;

        return remote.get('appdata',endpoint,'kinvey');
    }

    function RemoveFlight(flightId) {
        let endpoint = `flights/${flightId}`;
        return remote.remove('appdata',endpoint,'kinvey');
    }

    return {
        GetPublishedFlights,
        Add,
        GetSingleById,
        Edit,
        GetMyFlights,
        RemoveFlight
    }
})();