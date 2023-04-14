import React, { useState } from 'react';

interface LatLng {
    lat: number | null;
    lng: number | null;
}

interface WeatherForecast {
    name: string;
    temperature: number;
    detailedForecast: string;
    startTime: string;
    endTime: string;
}

function WeatherForecastApi(): JSX.Element {
    const [address, setAddress] = useState('');
    const [latLng, setLatLng] = useState<LatLng>({ lat: null, lng: null });
    const [forecast, setForecast] = useState<WeatherForecast[]>([]);
    const [error, setError] = useState('');

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch(
                `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${address}&benchmark=2020&format=json`
            );
            const data = await response.json();
            if (!data.result || !data.result.addressMatches || data.result.addressMatches.length === 0) {
                throw new Error('No results found');
            }
            const latitude = data.result.addressMatches[0].coordinates.y;
            const longitude = data.result.addressMatches[0].coordinates.x;
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            setLatLng({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
            setError('');
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
                setError(err.message);
            }
            setLatLng({ lat: null, lng: null });
        }
    };

    const fetchWeatherForecast = async () => {
        const res = await fetch(
            `https://api.weather.gov/points/${latLng.lat}%2C${latLng.lng}`
        );
        const gridpoint = await res.json();

        const response = await fetch(
            `${gridpoint.properties.forecast}`
        );
        const data = await response.json();

        if (data.properties && data.properties.periods) {
            setForecast(data.properties.periods);
            setError('');
        } else {
            setForecast([]);
            setError('No forecast available');
        }
    };

    React.useEffect(() => {
        if (latLng.lat && latLng.lng) {
            fetchWeatherForecast();
        } else {
            setForecast([]);
            setError('');
        }
    }, [latLng]);

    return (
        <div className='p-5'>
            <form onSubmit={handleFormSubmit}>
                <h1 className='font-bold from-neutral-800 text-2xl my-5'>Get the forecast for a specific US address</h1>
                <label htmlFor='address'>
                    Address:
                </label>
                <div className='flex flex-shrink'>
                    <input id='address' type="text" className='border-2 rounded-md border-slate-400 mb-2 p-2 w-full h-12' placeholder='Number, Street and City' value={address} onChange={(e) => setAddress(e.target.value)} />
                    <button type="submit" className='bg-black rounded-md text-white font-bold w-full max-w-xs h-12'>Get forecast</button>
                </div>
            </form>
            {error && <p>{error}</p>}
            {latLng.lat && latLng.lng && (
                <div>
                    <div className='flex flex-col mt-2 text-slate-500'>
                        <small>Latitude: {latLng.lat}</small>
                        <small>Longitude: {latLng.lng}</small>
                    </div>
                    {forecast.length > 0 ? (
                        <div>
                            <div className='flex flex-wrap justify-start box-border'>
                                {forecast.map((period) => (
                                    <div className='rounded-xl shadow-md p-4 w-1/3' key={period.startTime}>
                                        <div className='text-slate-500'>{new Date(period.startTime).toDateString()}</div>
                                        <div className='font-bold text-3xl text-slate-800'>{`${period.temperature} °F`}</div>
                                        <div className='text-sm'>{period.detailedForecast}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p>No forecast available</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default WeatherForecastApi;
