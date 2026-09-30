with open('src/components/HostPortalView.tsx', 'r') as f:
    c = f.read()

print(c.count("{/* Photo Upload Hint */}"))
print(c.count("{/* Card 3: $0 Security Deposit Platform Guarantee */}"))
