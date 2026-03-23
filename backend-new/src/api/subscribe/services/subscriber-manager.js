'use strict';

const SUBSCRIBER_UID = 'api::subscribe.subscribe';

const findByEmail = async (strapi, email) => {
  const records = await strapi.entityService.findMany(SUBSCRIBER_UID, {
    filters: { email },
    limit: 1,
  });
  return records[0] || null;
};

const upsertPending = async (strapi, { email, fullname, phone, organization, interests, source }) => {
  const existing = await findByEmail(strapi, email);

  if (!existing) {
    return await strapi.entityService.create(SUBSCRIBER_UID, {
      data: {
        fullname,
        email,
        phone,
        organization,
        interests,
        source,
        verified: false,
      },
    });
  }

  // Update pending details (keep verified state unless already verified)
  return await strapi.entityService.update(SUBSCRIBER_UID, existing.id, {
    data: {
      fullname,
      phone,
      organization,
      interests,
      source,
      verified: existing.verified ?? false,
    },
  });
};

const markVerified = async (strapi, { email, fullname, phone, organization, interests, source }) => {
  const existing = await findByEmail(strapi, email);

  if (!existing) {
    // Should be rare (OTP flow creates subscriber), but keep endpoint robust.
    return await strapi.entityService.create(SUBSCRIBER_UID, {
      data: {
        fullname,
        email,
        phone,
        organization,
        interests,
        source,
        verified: true,
      },
    });
  }

  return await strapi.entityService.update(SUBSCRIBER_UID, existing.id, {
    data: {
      fullname,
      phone,
      organization,
      interests,
      source,
      verified: true,
    },
  });
};

module.exports = {
  findByEmail,
  upsertPending,
  markVerified,
};

