import re

with open('bid-projects.html', 'r', encoding='utf-8') as f:
    text = f.read()

start_tag = '  <!-- ===== GEOGRAPHIC COVERAGE SECTION ===== -->'
end_tag = '  <!-- Footer -->'

start_idx = text.find(start_tag)
end_idx = text.find(end_tag)

new_ui = """  <!-- ===== PREMIUM DIRECTORY UI ===== -->
  <section style="background: #f4f7f9; padding: 4rem 2rem;">
    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start;">
      
      <!-- Left Sidebar: State Selector -->
      <aside style="background: #ffffff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); position: sticky; top: 2rem;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem;">Select State</h3>
        <ul id="state-list" style="list-style: none; margin: 0; padding: 0; max-height: 60vh; overflow-y: auto;">
          <li class="state-item active" onclick="showDirState(this, 'Georgia')">Georgia</li>
          <li class="state-item" onclick="showDirState(this, 'Alabama')">Alabama</li>
          <li class="state-item" onclick="showDirState(this, 'Arkansas')">Arkansas</li>
          <li class="state-item" onclick="showDirState(this, 'Arizona')">Arizona</li>
          <li class="state-item" onclick="showDirState(this, 'California')">California</li>
          <li class="state-item" onclick="showDirState(this, 'Florida')">Florida</li>
          <li class="state-item" onclick="showDirState(this, 'Texas')">Texas</li>
          <li class="state-item" onclick="showDirState(this, 'New York')">New York</li>
        </ul>
        <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 1rem; text-align: center;">+ 42 More States Available</div>
      </aside>

      <!-- Right Content: Database View -->
      <main style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); overflow: hidden; min-height: 60vh;">
        
        <!-- Georgia View -->
        <div id="dir-panel-Georgia" style="display: block;">
          <div style="padding: 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #fafbfc;">
            <div>
              <h2 style="font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem;">Georgia Database</h2>
              <p style="color: #64748b; font-size: 0.95rem; margin: 0;">159 Counties &mdash; 6,354 Companies Mapped</p>
            </div>
            <div style="background: #cc0000; color: white; padding: 0.5rem 1rem; border-radius: 50px; font-weight: 700; font-size: 0.85rem;">Phase 1 Ready</div>
          </div>
          <div style="padding: 2rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem;">
            <!-- County Cards Snippet -->
            <div class="dir-card"><span class="c-name">Appling</span><span class="c-num">65</span></div>
            <div class="dir-card"><span class="c-name">Atkinson</span><span class="c-num">37</span></div>
            <div class="dir-card"><span class="c-name">Bacon</span><span class="c-num">69</span></div>
            <div class="dir-card"><span class="c-name">Baker</span><span class="c-num">22</span></div>
            <div class="dir-card"><span class="c-name">Baldwin</span><span class="c-num">68</span></div>
            <div class="dir-card"><span class="c-name">Banks</span><span class="c-num">45</span></div>
            <div class="dir-card"><span class="c-name">Barrow</span><span class="c-num">47</span></div>
            <div class="dir-card"><span class="c-name">Bartow</span><span class="c-num">69</span></div>
            <div class="dir-card"><span class="c-name">Ben Hill</span><span class="c-num">62</span></div>
            <div class="dir-card"><span class="c-name">Berrien</span><span class="c-num">87</span></div>
            <!-- More counties would go here, simplified for display -->
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #94a3b8; font-size: 0.9rem; border: 1px dashed #cbd5e1; border-radius: 8px; margin-top: 1rem;">+ 149 more counties available in backend...</div>
          </div>
        </div>

        <!-- Other States View -->
        <div id="dir-panel-Other" style="display: none; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 5rem 2rem;">
          <div style="width: 80px; height: 80px; background: #fdf2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cc0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 id="dir-state-title" style="font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem;">Coming Soon</h2>
          <p style="color: #64748b; font-size: 1.05rem; max-width: 480px; line-height: 1.6; margin: 0 auto;">Company database listings for this state are actively being mapped for Phase 2 integration.<br><br>Contact our team at <a href="mailto:estimating@kjrid.com" style="color: #cc0000; font-weight: 600;">estimating@kjrid.com</a></p>
        </div>

      </main>
    </div>
  </section>

  <style>
    .state-item {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #475569;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 0.25rem;
    }
    .state-item:hover { background: #f1f5f9; color: #0f172a; }
    .state-item.active { background: #fef2f2; color: #cc0000; font-weight: 700; }
    
    .dir-card {
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
      cursor: pointer;
      background: white;
    }
    .dir-card:hover { border-color: #cc0000; box-shadow: 0 4px 12px rgba(204,0,0,0.08); transform: translateY(-2px); }
    .c-name { font-weight: 700; color: #1e293b; font-size: 0.85rem; }
    .c-num { background: #f1f5f9; color: #64748b; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 20px; }
    .dir-card:hover .c-num { background: #cc0000; color: white; }
    
    /* Scrollbar styling for state list */
    #state-list::-webkit-scrollbar { width: 6px; }
    #state-list::-webkit-scrollbar-track { background: transparent; }
    #state-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    
    @media(max-width: 768px) {
      div[style*="grid-template-columns: 280px 1fr"] { grid-template-columns: 1fr !important; }
      aside[style*="position: sticky"] { position: relative !important; top: 0 !important; }
      #state-list { display: flex; overflow-x: auto; max-height: max-content; padding-bottom: 0.5rem; }
      .state-item { white-space: nowrap; margin-bottom: 0; margin-right: 0.5rem; }
    }
  </style>

  <script>
    function showDirState(btn, state) {
      document.querySelectorAll('.state-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const gaPanel = document.getElementById('dir-panel-Georgia');
      const otherPanel = document.getElementById('dir-panel-Other');
      
      if(state === 'Georgia') {
        gaPanel.style.display = 'block';
        otherPanel.style.display = 'none';
      } else {
        gaPanel.style.display = 'none';
        otherPanel.style.display = 'flex';
        document.getElementById('dir-state-title').textContent = state + ' Database';
      }
    }
  </script>

"""

if start_idx != -1 and end_idx != -1:
    new_text = text[:start_idx] + new_ui + text[end_idx:]
    with open('bid-projects.html', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("UI completely replaced!")
