import { useState, type ComponentProps } from "react";
import { PanelLeftOpen, SlidersHorizontal } from "lucide-react";
import { SearchPanel } from "./SearchPanel";
import { Dialog } from "./Dialog";

export function ScoutingFilters(props: ComponentProps<typeof SearchPanel>) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className={`scouting-filters ${collapsed ? "filters-collapsed" : ""}`}>
      <button
        className="mobile-filter-trigger"
        onClick={() => setMobileOpen(true)}
      >
        <SlidersHorizontal size={17} /> Filters & recruitment brief
        {props.dirty && (
          <span className="brief-dot" aria-label="Unapplied changes" />
        )}
      </button>
      <div className="desktop-filter-panel">
        {collapsed ? (
          <button
            className="expand-filters"
            onClick={() => setCollapsed(false)}
            aria-label="Expand recruitment filters"
            title="Expand filters"
          >
            <PanelLeftOpen size={20} />
            <span>Filters</span>
            {props.dirty && <span className="brief-dot" />}
          </button>
        ) : (
          <SearchPanel {...props} onCollapse={() => setCollapsed(true)} />
        )}
      </div>
      <Dialog
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Recruitment brief"
        className="filter-drawer"
      >
        <SearchPanel
          {...props}
          onSearch={() => {
            props.onSearch();
            setMobileOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}
