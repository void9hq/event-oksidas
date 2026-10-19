<script>
  // RSVP form + public count. Talks to server/server.js (/api/count, /api/rsvp).
  import { onMount } from 'svelte';

  let count = $state(null);
  let status = $state('idle'); // idle | sending | done | error
  let error = $state('');
  let errField = $state('');
  let updated = $state(false);
  const f = $state({ first_name: '', last_name: '', email: '', phone: '', consent: false, website: '' });

  onMount(async () => {
    try {
      const r = await fetch('/api/count');
      if (r.ok) count = (await r.json()).count;
    } catch {
      // count is decoration; the form still works
    }
  });

  async function submit(e) {
    e.preventDefault();
    status = 'sending';
    error = errField = '';
    try {
      const r = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(f),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(j.error ?? 'Nepavyko išsiųsti. Pabandykite dar kartą.'), { field: j.field });
      count = j.count;
      updated = j.updated;
      status = 'done';
    } catch (err) {
      status = 'error';
      // fetch rejects with TypeError on network failure
      error = err instanceof TypeError ? 'Nepavyko susisiekti su serveriu.' : err.message;
      errField = err.field ?? '';
    }
  }

  const invalid = (k) => (errField === k ? 'true' : undefined);
</script>

<div class="rsvp">
  {#if count !== null}
    <p class="count"><span class="n">{count}</span> <span class="muted">jau užsiregistravo</span></p>
  {/if}

  {#if status === 'done'}
    <p class="ok" role="status">
      Ačiū, {f.first_name}! {updated ? 'Jūsų registracijos duomenys atnaujinti.' : 'Registracija gauta, iki pasimatymo.'}
    </p>
  {:else}
    <form onsubmit={submit}>
      <div class="row">
        <label>
          <span>Vardas</span>
          <input name="first_name" autocomplete="given-name" required maxlength="100" bind:value={f.first_name} aria-invalid={invalid('first_name')} />
        </label>
        <label>
          <span>Pavardė</span>
          <input name="last_name" autocomplete="family-name" required maxlength="100" bind:value={f.last_name} aria-invalid={invalid('last_name')} />
        </label>
      </div>
      <div class="row">
        <label>
          <span>El. paštas</span>
          <input name="email" type="email" autocomplete="email" required maxlength="254" bind:value={f.email} aria-invalid={invalid('email')} />
        </label>
        <label>
          <span>Telefonas</span>
          <input
            name="phone"
            type="tel"
            autocomplete="tel"
            required
            maxlength="32"
            placeholder="+370 600 00000"
            bind:value={f.phone}
            aria-invalid={invalid('phone')}
          />
        </label>
      </div>

      <!-- honeypot: hidden from people and screen readers, bots tend to fill it -->
      <div class="hp" aria-hidden="true">
        <label>Svetainė <input name="website" tabindex="-1" autocomplete="off" bind:value={f.website} /></label>
      </div>

      <label class="consent">
        <input type="checkbox" required bind:checked={f.consent} aria-invalid={invalid('consent')} />
        <span>Sutinku, kad mano duomenys būtų naudojami tik šio renginio organizavimui. Po renginio jie bus ištrinti.</span>
      </label>

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Siunčiama…' : 'Registruotis'}
      </button>
      <p class="err" role="alert">{error}</p>
    </form>
  {/if}
</div>

<style>
  .rsvp {
    max-width: 720px;
  }
  .count {
    margin: 0 0 20px;
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  .n {
    font: 700 clamp(40px, 6vw, 64px) / 1 var(--head);
    color: var(--accent);
  }
  .muted {
    color: var(--muted);
  }
  form {
    display: grid;
    gap: 16px;
  }
  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  label span {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    color: var(--muted);
  }
  input:not([type='checkbox']) {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    font: inherit;
    color: var(--fg);
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 4px;
  }
  input:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  input[aria-invalid='true'] {
    border-color: var(--accent);
  }
  .consent {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 15px;
    color: var(--muted);
  }
  .consent span {
    margin: 0;
    font-size: 15px;
  }
  .consent input {
    margin-top: 4px;
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
    flex: none;
  }
  button {
    justify-self: start;
    padding: 14px 28px;
    font: 700 18px var(--head);
    color: var(--bg);
    background: var(--accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  .err {
    margin: 0;
    min-height: 1.5em;
    color: var(--accent);
  }
  .ok {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }
  .hp {
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
</style>
