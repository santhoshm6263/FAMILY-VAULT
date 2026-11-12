import React, { useState, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  Search,
  Plus,
  Grid,
  List,
  X,
  RotateCcw,
  FileText
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { DOCUMENT_CATEGORIES } from '../../data/categories';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { DocumentTable } from '../../components/documents/DocumentTable';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import { DocumentEditModal } from '../../components/documents/DocumentEditModal';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const DocumentsPage = () => {
  const { documents, members, deleteDocument } = useVault();
  const { openUploadModal } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State from URL or local
  const urlCategory = searchParams.get('category') || 'all';
  const urlMember = searchParams.get('member') || 'all';
  const urlSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedMember, setSelectedMember] = useState(urlMember);
  const [selectedSideFilter, setSelectedSideFilter] = useState('all'); // 'all' | 'dual' | 'single'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal states
  const [previewDoc, setPreviewDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);

  // Synchronize category or search when URL changes
  React.useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  React.useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  React.useEffect(() => {
    if (urlMember) {
      setSelectedMember(urlMember);
    }
  }, [urlMember]);

  // Filtered & Sorted documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catObj = DOCUMENT_CATEGORIES.find((c) => c.id === selectedCategory);
        if (doc.category !== selectedCategory && !doc.categoryName.toLowerCase().includes((catObj?.name || selectedCategory).toLowerCase())) {
          return false;
        }
      }

      // Member filter
      if (selectedMember !== 'all' && doc.memberId !== selectedMember) {
        return false;
      }

      // Side filter (dual vs single)
      if (selectedSideFilter === 'dual' && !doc.hasBackSide) return false;
      if (selectedSideFilter === 'single' && doc.hasBackSide) return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchNumber = doc.documentNumber?.toLowerCase().includes(q);
        const matchMember = doc.memberName.toLowerCase().includes(q);
        const matchCategory = doc.categoryName?.toLowerCase().includes(q);
        const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
        const matchNotes = doc.notes?.toLowerCase().includes(q);

        if (!matchTitle && !matchNumber && !matchMember && !matchCategory && !matchTags && !matchNotes) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
      if (sortBy === 'oldest') return new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [documents, selectedCategory, selectedMember, selectedSideFilter, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMember('all');
    setSelectedSideFilter('all');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedMember !== 'all' || selectedSideFilter !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        onEdit={(d) => setEditingDoc(d)}
        onDelete={(id) => deleteDocument(id)}
      />

      {/* Edit Modal */}
      <DocumentEditModal
        document={editingDoc}
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
      />

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            Document Management Repository
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Browse, search, and inspect front & back scans of verified family documents
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openUploadModal}>
          Upload New Document
        </Button>
      </div>

      {/* Category Pills Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSearchParams({});
          }}
          style={{
            padding: '7px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            backgroundColor: selectedCategory === 'all' ? 'var(--primary)' : '#ffffff',
            color: selectedCategory === 'all' ? '#ffffff' : 'var(--slate-600)',
            border: selectedCategory === 'all' ? '1px solid var(--primary)' : '1px solid var(--slate-200)',
            boxShadow: selectedCategory === 'all' ? 'var(--shadow-xs)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          All Categories ({documents.length})
        </button>

        {DOCUMENT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = documents.filter((d) => d.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchParams({ category: cat.id });
              }}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                backgroundColor: isSelected ? 'var(--primary)' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--slate-600)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--slate-200)',
                boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter and Control Bar */}
      <div
        className="fv-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--slate-400)'
            }}
          />
          <input
            type="text"
            placeholder="Search by title, ID number, tags, or holder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '0.84rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              backgroundColor: 'var(--slate-50)',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-400)',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Multi-Filters Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Member filter */}
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              backgroundColor: '#ffffff',
              color: 'var(--slate-700)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Family Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relation})
              </option>
            ))}
          </select>

          {/* Capture Side filter */}
          <select
            value={selectedSideFilter}
            onChange={(e) => setSelectedSideFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              backgroundColor: '#ffffff',
              color: 'var(--slate-700)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Capture Sides</option>
            <option value="dual">Front & Back Sides Only</option>
            <option value="single">Single Sided Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              backgroundColor: '#ffffff',
              color: 'var(--slate-700)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--slate-100)',
              padding: '3px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--slate-500)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--slate-500)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          {/* Reset filter button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '7px 10px',
                fontSize: '0.78rem',
                color: 'var(--rose-600)',
                backgroundColor: 'var(--rose-50)',
                border: '1px solid var(--rose-100)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Reset all search & filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem', color: 'var(--slate-500)' }}>
        <div>
          Showing <strong>{filteredDocuments.length}</strong> of <strong>{documents.length}</strong> documents
          {hasActiveFilters && ' (filtered)'}
        </div>
      </div>

      {/* Document Content View */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description={
            hasActiveFilters
              ? 'No documents matched your current search filters. Try adjusting keywords or clearing category constraints.'
              : 'Your family vault is currently empty. Start by uploading an Aadhaar card, PAN, or passport.'
          }
          actionText={hasActiveFilters ? 'Clear All Filters' : 'Upload First Document'}
          onAction={hasActiveFilters ? handleClearFilters : openUploadModal}
          actionIcon={hasActiveFilters ? RotateCcw : Plus}
        />
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onPreview={(d) => setPreviewDoc(d)}
              onEdit={(d) => setEditingDoc(d)}
              onDelete={(id) => deleteDocument(id)}
            />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={filteredDocuments}
          onPreview={(d) => setPreviewDoc(d)}
          onEdit={(d) => setEditingDoc(d)}
          onDelete={(id) => deleteDocument(id)}
        />
      )}
    </div>
  );
};

