/* eslint-disable */
// Repti-track — App composition

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "terrarium",
  "showFrames": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
  }, [t.theme]);

  const showFrame = t.showFrames;
  const ABW = showFrame ? 420 : 390;
  const ABH = showFrame ? 884 : 844;

  return (
    <>
      <DesignCanvas>
        <DCSection id="overview" title="Overview">
          <DCArtboard id="home" label="Home — dashboard" width={ABW} height={ABH}>
            <Phone showFrame={showFrame}><HomeScreen/></Phone>
          </DCArtboard>

          <DCArtboard id="list" label="Reptiles — collection" width={ABW} height={ABH}>
            <Phone showFrame={showFrame}><ReptilesScreen/></Phone>
          </DCArtboard>

          <DCArtboard id="detail" label="Reptile — detail" width={ABW} height={ABH}>
            <Phone showFrame={showFrame}><ReptileDetailScreen/></Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="feed" title="Batch feed flow">
          <DCArtboard id="feed-select" label="Pick who's eating" width={ABW} height={ABH}>
            <Phone showFrame={showFrame}><BatchFeedSelectScreen/></Phone>
          </DCArtboard>

          <DCArtboard id="feed-speed" label="Speed mode — ate / refused" width={ABW} height={ABH}>
            <Phone showFrame={showFrame}><BatchFeedScreen/></Phone>
          </DCArtboard>
        </DCSection>

        <DCSection id="utility" title="QR · Stickers">
          <DCArtboard id="scan" label="Scan sticker (dark)" width={ABW} height={ABH}>
            <Phone showFrame={showFrame} dark><ScanScreen/></Phone>
          </DCArtboard>

          <DCArtboard id="stickers" label="Stickers — print sheet" width={ABW} height={ABH}>
            <Phone showFrame={showFrame}><StickersScreen/></Phone>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio
            value={t.theme}
            onChange={(v) => setTweak('theme', v)}
            options={[
              { value: 'terrarium', label: 'Terra' },
              { value: 'moonlight', label: 'Moon' },
              { value: 'linen',     label: 'Linen' },
            ]}
          />
        </TweakSection>
        <TweakSection label="Canvas">
          <TweakToggle
            label="Phone frames"
            value={t.showFrames}
            onChange={(v) => setTweak('showFrames', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// Phone wrapper — either with iOS bezel or just the screen
function Phone({ children, dark = false, showFrame = true }) {
  if (showFrame) {
    return (
      <IOSDevice width={390} height={844} dark={dark}>
        {children}
      </IOSDevice>
    );
  }
  return (
    <div style={{
      width: 390, height: 844, borderRadius: 32, overflow: 'hidden',
      background: dark ? '#0A0F0C' : 'var(--bg)',
      boxShadow: '0 30px 60px -20px rgba(23,51,33,0.25), 0 0 0 1px var(--line)',
      position: 'relative',
    }}>
      {children}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
