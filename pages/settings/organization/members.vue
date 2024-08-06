<script setup lang="ts">
  const { getAllOrganizationUsers } = useManageOrganization();

  const { data: users, refresh } = await getAllOrganizationUsers();
</script>

<template>
  <SectionContainer>
    <SectionHeading
      title="Members"
      subtitle="Manage your organization members."
    >
    </SectionHeading>
    <BoxContainer> Members </BoxContainer>
    <pre>{{ users }}</pre>
  </SectionContainer>
</template>
