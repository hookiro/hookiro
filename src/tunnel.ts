import ngrok from '@ngrok/ngrok';

export async function startTunnel(port: number): Promise<string> {
  try {
    const listener = await ngrok.forward({
      addr: port,
      authtoken_from_env: true,
    });
    return listener.url() || '';
  } catch (error) {
    // If ngrok fails (no auth token, network issues, etc.), return empty string
    // This allows the app to continue running locally
    console.warn('⚠️  ngrok tunnel failed to start. You can still use the local endpoint.');
    return '';
  }
}
