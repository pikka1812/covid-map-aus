class Clinic {
    constructor(name, address, condition, openTime, note, coord, url) {
        this.name = name;
        this.address = address;
        this.condition = condition;
        this.openTime = openTime;
        this.note = note;
        this.coord = coord;
        this.url = url;
    }
}


const clinics = [
    new Clinic("COVID-19 Testing Clinic - Hobart Mac Point", "Macquarie Point, Behind 16A Evans St", "Bookings required for PCR test", "8:30am to 3:30pm open 7 days a week", "Call the Public Health Hotline on 1800 671 738 or register online",{lat: -42.8813533, lng: 147.3356753}, "https://www.google.com/maps/place/16a+Evans+St,+Hobart+TAS+7000"),
    new Clinic("COVID-19 Testing Clinic - Hobart Showgrounds", "Hobart Showgrounds, Howard Road Glenorchy", "To get a PCR test, just turn up at the testing site", "8:00am to 12:00noon Monday-Saturday", "This clinic is primarily for the collection of specimens for GP referrals, hospital pre-admission and international travel PCR testing. Anyone with symptoms should always call the Public Health Hotline on 1800 671 738 or register online",{lat:-42.8325653,lng:147.2832879},"https://www.google.com/maps/place/Hobart+Showground/"),
    new Clinic("COVID-19 Testing Clinic - Launceston", "63 Dowling Street", "Bookings required for PCR test", "8:30am to 3:30pm open 7 days a week", "Call the Public Health Hotline on 1800 671 738 or register online", {lat:-41.4279951, lng: 147.1507152},"https://www.google.com/maps/place/63+Dowling+St,+Launceston+TAS+7250"),
    new Clinic("COVID-19 Testing Clinic - Devonport", "East Devonport Recreation Centre (access via John Street)", "To get a PCR test, just turn up to the testing site during operating hours","8:30am to 3:30pm open 7 days a week","RAT kits must be requested via the online request form",{lat:-41.1846404,lng:146.3781877},"https://www.google.com/maps/place/East+Devonport+Recreation+%26+Function+Centre"),
    new Clinic("COVID-19 Testing Clinic - Burnie", "46 Wellington Street, South Burnie", "Bookings required for PCR test", "9:00am to 1:00pm open 7 days a week", "Call the Public Health Hotline on 1800 671 738 or register online",{lat:-41.0636382, lng: 145.9086002},"https://www.google.com/maps/place/46+Wellington+St,+South+Burnie+TAS+7320")
]


const defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-43.657607, 143.819218),
    new google.maps.LatLng(-39.206708, 148.481887)
);
function completeAddress() {
    const input = document.getElementById("input-address");
    const options = {
        bounds: defaultBounds,
        strictBounds: true,
        type: ["address"],
        componentRestrictions: {country: 'AU'}
    }
    const autocomplete = new google.maps.places.Autocomplete(input, options);
}

google.maps.event.addDomListener(window, 'load', completeAddress);


var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

function success(pos) {
    var crd = pos.coords;
    displayClinic({lat: crd.latitude, lng: crd.longitude});
}

$("#find-address").click(function() {
    const geocoder = new google.maps.Geocoder();
    const address = document.getElementById("input-address").value;
    geocoder.geocode({'address': address}, function (result, status) {
        if(status === 'OK') {
            displayClinic(result[0].geometry.location);
        } else {
            window.alert('Geocode was not successful for the following reason: ' + status);
        }
    });
    return false;
})

$("#current-location").click(function() {
    navigator.geolocation.getCurrentPosition(success, error, options);
    return false;
});

async function displayClinic(address) {
    let clinicsContainer = document.getElementById("clinic-container");
    clinicsContainer.innerHTML = "";
    const service = new google.maps.DistanceMatrixService();

    for (let x of clinics) {
        const request = {
            origins : [address],
            destinations: [x.coord],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
        };

        await service.getDistanceMatrix(request).then((response) => {
            const distance = response.rows[0].elements[0].distance.text;
            const duration = response.rows[0].elements[0].duration.text;

            clinicsContainer.innerHTML+= `
                <div class="row mt-5">
                    <div class="col-sm-8" style="text-align: left;">
                        <p class="h4 text-black">${x.name}</p>
                        <p class="h5 text-primary">${x.address}</p>
                        <p class="h6 text-secondary">${distance}   ||    ${duration}</p>
                        <p>${x.condition}</p>
                        <p>Open time: <b>${x.openTime}</b></p>
                        <p style="font-style: italic;">Note: ${x.note}</p>
                    </div>
                    <div class="col-sm-4" style="text-align: right;">
                        <a class="btn btn-outline-primary" href="https://covidtestbooking.health.tas.gov.au/">Register online</a>
                        <a class="btn btn-outline-primary" href=${x.url}>Direction</a>
                    </div>
                </div>`
        })
    }
};