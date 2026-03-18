<script lang="ts">
  import { onMount } from "svelte";
  import { fetchLocations, type LocationResult } from "../api/chartApi";

  interface Props {
    /** Display string for the input. */
    value?: string;
    placeholder?: string;
    onSelect: (loc: LocationResult) => void;
    /** Called when user clears the input (removes selected location). */
    onClear?: () => void;
  }
  let { value = "", placeholder = "Search for a city…", onSelect, onClear }: Props = $props();

  let query = $state("");
  let suggestions = $state<LocationResult[]>([]);
  let loading = $state(false);
  let open = $state(false);
  let highlightedIndex = $state(0);
  let focused = $state(false);
  let debounceId: ReturnType<typeof setTimeout> | null = null;
  let containerEl: HTMLDivElement;

  function scheduleSearch() {
    // When user clears input, notify parent and reset prevValue so we don't overwrite on next sync
    if (query.trim() === "" && prevValue !== undefined) {
      prevValue = "";
      onClear?.();
    }
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(async () => {
      debounceId = null;
      const q = query.trim();
      if (!q || q.length < 2) {
        suggestions = [];
        open = false;
        return;
      }
      loading = true;
      try {
        suggestions = await fetchLocations(q, 10);
      } catch {
        suggestions = [];
      } finally {
        loading = false;
      }
      open = true;
      highlightedIndex = 0;
    }, 250);
  }

  // Sync from parent only when value prop changes (e.g. on select). Never sync while focused
  // so the user can edit without the effect overwriting their input.
  let prevValue = $state<string | undefined>(undefined);
  $effect(() => {
    const v = value ?? "";
    if (!focused && v !== prevValue) {
      prevValue = v;
      query = v;
    }
  });

  function select(loc: LocationResult) {
    prevValue = loc.display;
    query = loc.display;
    suggestions = [];
    open = false;
    onSelect(loc);
  }

  function handleBlur() {
    focused = false;
    setTimeout(() => {
      open = false;
      highlightedIndex = -1;
    }, 150);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % suggestions.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightedIndex = highlightedIndex <= 0 ? suggestions.length - 1 : highlightedIndex - 1;
    } else if (e.key === "Enter" && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      e.preventDefault();
      select(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      open = false;
      highlightedIndex = -1;
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerEl && !containerEl.contains(e.target as Node)) open = false;
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });
</script>

<div class="location-input" bind:this={containerEl}>
  <input
    type="text"
    bind:value={query}
    oninput={scheduleSearch}
    onfocus={() => {
      focused = true;
      if (query.trim().length >= 2) open = true;
      highlightedIndex = -1;
    }}
    onblur={handleBlur}
    onkeydown={handleKeydown}
    {placeholder}
    autocomplete="off"
    role="combobox"
    aria-expanded={open}
    aria-controls="location-listbox"
    aria-activedescendant={open && highlightedIndex >= 0 ? `location-opt-${highlightedIndex}` : undefined}
  />
  {#if loading}
    <span class="loading" aria-hidden="true">…</span>
  {/if}
  {#if open && suggestions.length > 0}
    <ul class="suggestions" role="listbox" id="location-listbox">
      {#each suggestions as loc, i}
        <li
          id="location-opt-{i}"
          role="option"
          aria-selected={i === highlightedIndex}
          class:highlighted={i === highlightedIndex}
          onmouseenter={() => (highlightedIndex = i)}
          onmousedown={(e) => { e.preventDefault(); select(loc); }}
        >
          {loc.display}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .location-input {
    position: relative;
  }
  .location-input input {
    width: 100%;
    padding: 0.5rem 0.6rem;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 6px;
    color: #c9d1d9;
    font-size: inherit;
  }
  .location-input input:focus {
    outline: none;
    border-color: #58a6ff;
  }
  .loading {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #8b949e;
    pointer-events: none;
  }
  .suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0.25rem 0;
    list-style: none;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
  }
  .suggestions li {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    color: #c9d1d9;
    font-size: 0.9rem;
  }
  .suggestions li:hover,
  .suggestions li.highlighted {
    background: #21262d;
    color: #fff;
  }
</style>
