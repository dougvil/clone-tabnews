import useSWR from 'swr';

function fetchStatus() {
  return fetch('/api/v1/status')
    .then((response) => response.json())
    .catch(() => ({ status: 'unknown' }));
}

export default function StatusPage() {
  const { data, error, isLoading } = useSWR('/api/v1/status', fetchStatus, {
    refreshInterval: 5000,
  });
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      <pre>
        {error ? 'Error fetching status' : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
