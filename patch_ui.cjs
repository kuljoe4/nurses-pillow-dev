const fs = require('fs');
let code = fs.readFileSync('src/components/HostPortalView.tsx', 'utf8');

const uiTarget = `                  <div className="space-y-2">
                    <button
                      onClick={handleConnectStripe}
                      className="w-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
                      <span>Connect via Stripe</span>
                    </button>
                    <button
                      onClick={handleDirectActivatePayouts}
                      className="w-full bg-[#EFF6FB] dark:bg-[#15233a] hover:bg-[#e0eef7] text-[#0A6FA8] dark:text-[#3E9AD1] border border-[#0A6FA8]/30 text-xs font-bold py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      <span>Verify &amp; Activate Direct Deposit</span>
                    </button>
                  </div>`;

const newUi = `                  <div className="space-y-2">
                    {showEmbeddedOnboarding && stripeConnectInstance ? (
                        <div className="w-full h-[600px] bg-white rounded-lg border border-neutral-200 overflow-hidden">
                            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                                <ConnectAccountOnboarding onExit={() => {
                                    setShowEmbeddedOnboarding(false);
                                    fetchPayoutStatus();
                                }} />
                            </ConnectComponentsProvider>
                        </div>
                    ) : (
                        <>
                            <button
                              onClick={handleConnectStripe}
                              className="w-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
                              <span>Connect via Stripe</span>
                            </button>
                            <button
                              onClick={handleDirectActivatePayouts}
                              className="w-full bg-[#EFF6FB] dark:bg-[#15233a] hover:bg-[#e0eef7] text-[#0A6FA8] dark:text-[#3E9AD1] border border-[#0A6FA8]/30 text-xs font-bold py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[15px]">verified</span>
                              <span>Verify &amp; Activate Direct Deposit</span>
                            </button>
                        </>
                    )}
                  </div>`;

code = code.replace(uiTarget, newUi);
fs.writeFileSync('src/components/HostPortalView.tsx', code);
