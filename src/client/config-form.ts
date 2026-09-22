/**
 * The configuration-form contract this browser half consumes, declared
 * structurally.
 *
 * The runtime face belongs to `@deepseek-ai/dsh-client-ui-settings`, but the
 * settings surface moved across harness lines — the per-namespace
 * `ctx.settingsScope` service is gone and `ctx.configForms.get(entryId)`
 * replaced it — and a standalone bundle may not take a value import from a
 * plugin package. Declaring the shape locally keeps this half compiling
 * against the real contract without pinning a host package layout: the page
 * owner passes its own `ConfigForm` instance, which satisfies these members
 * exactly.
 *
 * @module dsh-ticktick/client/config-form
 */

/** JSON-shaped value a settings field can carry. */
export type TicktickJsonValue = string | number | boolean | null | TicktickJsonValue[] | { [key: string]: TicktickJsonValue }

/** One path-addressed edit: `set` writes at the path, `unset` removes it. */
export type TicktickPathOp =
  | { op: 'set'; path: string[]; value: TicktickJsonValue }
  | { op: 'unset'; path: string[] }

/** One schema-declared secret slot. The VALUE never leaves the Host. */
export interface TicktickSecretView {
  /** Path from the section root to the removed field. */
  path: string[]
  /** Whether the slot currently holds a value. */
  set: boolean
}

/** Accepted Host values for one profile entry, plus the redaction ledger. */
export interface TicktickFormSnapshot {
  /** Last accepted schema-resolved section; `undefined` before the first acceptance. */
  value: Record<string, unknown> | undefined
  /** Every schema-declared secret slot with its configured state. */
  secrets?: readonly TicktickSecretView[]
  /** Namespace revision fencing the next write. */
  revision?: number | undefined
  /** Whether the Host document accepts writes. */
  writable?: boolean
}

/**
 * The Host-owned values and write actions for one profile entry, as supplied
 * by the Plugins page owner.
 */
export interface TicktickForm {
  /** @returns the current sync snapshot. */
  getSnapshot(): TicktickFormSnapshot
  /**
   * Observe snapshot replacements.
   * @param listener - invoked after each snapshot change.
   * @returns the disposer removing this listener.
   */
  subscribe(listener: () => void): () => void
  /**
   * Queue one atomic namespace mutation; all operations share one revision fence.
   * @param ops - ordered field operations.
   * @returns true for Host acceptance, false for refusal.
   */
  mutate(ops: readonly TicktickPathOp[]): Promise<boolean>
}
