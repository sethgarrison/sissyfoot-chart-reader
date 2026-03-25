<script lang="ts">
  /**
   * Generic editable data table. Renders rows with inline-editable cells.
   * Editable fields save on blur; read-only fields are displayed only.
   */
  interface Column<T> {
    key: keyof T & string;
    label: string;
    editable?: boolean;
    multiline?: boolean;
    type?: "text" | "number";
  }

  interface Props<T extends { id: number }> {
    columns: Column<T>[];
    data: T[];
    onSave: (id: number, update: Partial<T>) => Promise<T>;
  }

  let { columns, data, onSave }: Props<any> = $props();

  const sortedData = $derived([...data].sort((a, b) => a.id - b.id));

  let savingId = $state<number | null>(null);
  let error = $state<string | null>(null);
  let editState = $state<Record<string, string>>({});

  function getCellValue(row: any, key: string): string {
    const v = row[key];
    return v == null ? "" : String(v);
  }

  function getEditKey(id: number, key: string): string {
    return `${id}:${key}`;
  }

  function getEditValue(row: any, key: string): string {
    const ek = getEditKey(row.id, key);
    if (ek in editState) return editState[ek];
    return getCellValue(row, key);
  }

  function setEditValue(row: any, key: string, value: string) {
    const k = getEditKey(row.id, key);
    editState = { ...editState, [k]: value };
  }

  function coerceValue(value: string, col: Column<any>): string | number | null {
    if (value === "") return null;
    if (col.type === "number") {
      const n = Number(value);
      return Number.isNaN(n) ? null : n;
    }
    return value;
  }

  async function handleBlur(row: any, col: Column<any>) {
    if (!col.editable) return;
    const key = col.key;
    const current = getCellValue(row, key);
    const edited = getEditValue(row, key);
    if (edited === current) {
      const ek = getEditKey(row.id, key);
      const next = { ...editState };
      delete next[ek];
      editState = next;
      return;
    }
    savingId = row.id;
    error = null;
    try {
      const value = coerceValue(edited, col);
      await onSave(row.id, { [key]: value } as any);
      const ek = getEditKey(row.id, key);
      const next = { ...editState };
      delete next[ek];
      editState = next;
    } catch (e) {
      error = e instanceof Error ? e.message : "Save failed";
    } finally {
      savingId = null;
    }
  }

  function handleInput(row: any, col: Column<any>, e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setEditValue(row, col.key, target.value);
  }
</script>

<div class="editable-table-wrap">
  {#if error}
    <div class="table-error">{error}</div>
  {/if}
  <div class="table-scroll">
    <table class="editable-table">
      <thead>
        <tr>
          {#each columns as col}
            <th>{col.label}</th>
          {/each}
          <th class="save-col"></th>
        </tr>
      </thead>
      <tbody>
        {#each sortedData as row}
          <tr class:saving={savingId === row.id}>
            {#each columns as col}
              <td class:multiline={col.multiline}>
                {#if col.editable}
                  {#if col.multiline}
                    <textarea
                      class="cell-input multiline"
                      value={getEditValue(row, col.key)}
                      oninput={(e) => handleInput(row, col, e)}
                      onblur={() => handleBlur(row, col)}
                      rows="3"
                      placeholder="—"
                    ></textarea>
                  {:else}
                    <input
                      type={col.type === "number" ? "number" : "text"}
                      class="cell-input"
                      value={getEditValue(row, col.key)}
                      oninput={(e) => handleInput(row, col, e)}
                      onblur={() => handleBlur(row, col)}
                      placeholder="—"
                      step={col.type === "number" ? "any" : undefined}
                    />
                  {/if}
                {:else}
                  <span class="cell-readonly">{getCellValue(row, col.key) || "—"}</span>
                {/if}
              </td>
            {/each}
            <td class="save-col">
              {#if savingId === row.id}
                <span class="saving-badge">Saving…</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .editable-table-wrap {
    width: 100%;
    overflow: hidden;
  }
  .table-error {
    padding: 0.5rem 0.75rem;
    background: rgba(248, 81, 73, 0.15);
    border: 1px solid #f85149;
    color: #f85149;
    font-size: 13px;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }
  .table-scroll {
    overflow-x: auto;
    max-height: 70vh;
    overflow-y: auto;
  }
  .editable-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .editable-table th,
  .editable-table td {
    padding: 0.4rem 0.6rem;
    border: 1px solid #30363d;
    text-align: left;
    vertical-align: top;
  }
  .editable-table th {
    background: #21262d;
    color: #8b949e;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .editable-table tbody tr:hover {
    background: rgba(56, 139, 253, 0.05);
  }
  .editable-table tbody tr.saving {
    background: rgba(35, 134, 54, 0.08);
  }
  .cell-input {
    width: 100%;
    min-width: 80px;
    padding: 0.25rem 0.4rem;
    background: #161b22;
    border: 1px solid #30363d;
    color: #c9d1d9;
    font: inherit;
    font-size: 12px;
    border-radius: 4px;
  }
  .cell-input:focus {
    outline: none;
    border-color: #58a6ff;
    box-shadow: 0 0 0 1px #58a6ff;
  }
  .cell-input.multiline {
    min-height: 4em;
    resize: vertical;
  }
  .cell-readonly {
    color: #8b949e;
    font-size: 12px;
  }
  .save-col {
    width: 70px;
    min-width: 70px;
    text-align: center;
  }
  .saving-badge {
    font-size: 11px;
    color: #3fb950;
  }
  td.multiline .cell-input {
    min-width: 200px;
  }
</style>
