
policydir = $(datadir)/polkit-1/actions
dist_policy_DATA = org.freedesktop.policykit.pkexec.cinnamon.nautilus-run.policy
@INTLTOOL_POLICY_RULE@

clean-local :
	rm -f *~ *.policy

DISTCLEANFILES = $(dist_policy_DATA)

EXTRA_DIST = $(dist_policy_DATA:.policy=.policy.in)
