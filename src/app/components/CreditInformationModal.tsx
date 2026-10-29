"use client";

import React, { useState } from "react";
import { DesktopOutlined, HeartOutlined, InfoCircleOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Modal, Timeline, Typography } from "antd";
import Image from "next/image";
import { withBasePath } from "@/src/lib/base-path";

const { Paragraph, Title } = Typography;

export default function CreditInformationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [techOpen, setTechOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);

  const devTeam = ["Irfan Akbari Habibi", "Om Wissa", "Om Selpian", "Mas Sirojul Kahfi"];
  const warehouseTeam = ["Pak Anggo", "Pak Rizky", "Om Andry"];

  return (
    <>
      <Modal
        className="ansei-credit-modal"
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", padding: 8, borderRadius: 4, color: "white", background: "#4C6A85" }}>
              <InfoCircleOutlined />
            </span>
            <div>
              <div>Credits & Information</div>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 400 }}>The people behind WH Packer System</div>
            </div>
          </div>
        }
        open={open}
        centered
        onCancel={onClose}
        width={820}
        footer={[
          <Button key="updates" onClick={() => setUpdatesOpen(true)}>Update Log</Button>,
          <Button key="tech" onClick={() => setTechOpen(true)}>Tech Stack</Button>,
          <Button key="privacy" onClick={() => setPrivacyOpen(true)}>Privacy Policy</Button>,
          <Button key="close" type="primary" onClick={onClose}>Close</Button>,
        ]}
      >
        <div className="credit-rise" style={{ padding: "12px 0 4px" }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
              marginBottom: 24,
              padding: "24px 20px",
              borderRadius: 6,
              color: "white",
              background: "#263545",
            }}
          >
            <HeartOutlined style={{ fontSize: 26, color: "#fecaca" }} />
            <h2 style={{ margin: "10px 0 0", fontSize: 22, color: "white" }}>WH Packer System</h2>
            <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.85)", fontSize: 13 }}>
              Crafted through the collaboration of IT and Warehouse & Production Teams
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 20 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ padding: "16px 18px", borderRadius: 6, background: "#EDF2F6" }}>
                <div style={{ color: "#4C6A85", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CORE DEVELOPER</div>
                <div style={{ marginTop: 4, color: "#293241", fontSize: 18, fontWeight: 700 }}>IT Development Team</div>
                <div style={{ marginTop: 6, color: "#475569", fontStyle: "italic", fontSize: 12 }}>
                  “Precision in logic, excellence in execution — crafting digital tools that empower manufacturing every day.”
                </div>
              </div>
              <div style={{ padding: 14, background: "#304254", borderRadius: 6, color: "white", fontSize: 13 }}>
                <h4 style={{ margin: "0 0 8px", color: "#f1f5f9" }}>⭐ Project Advisors</h4>
                {["Pak Supriadi", "Pak Hermanto", "Pak Abdillah"].map((name) => (
                  <div key={name} style={{ padding: "2px 0" }}>• {name}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
              <div>
                <h4 style={{ margin: "0 0 8px" }}><DesktopOutlined /> IT Team</h4>
                {devTeam.map((name) => (
                  <div key={name} style={{ padding: "3px 0" }}>● {name}</div>
                ))}
              </div>
              <div>
                <h4 style={{ margin: "0 0 8px" }}><UserOutlined /> Warehouse Ops</h4>
                {warehouseTeam.map((name) => (
                  <div key={name} style={{ padding: "3px 0" }}>● {name}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 14, textAlign: "center", color: "#999", fontSize: 12 }}>
            Developed with <HeartOutlined style={{ color: "#dc2626" }} /> by PT Vuteq Indonesia
          </div>
        </div>
      </Modal>

      <Modal
        title="Technology Stack"
        open={techOpen}
        centered
        onCancel={() => setTechOpen(false)}
        footer={<Button type="primary" onClick={() => setTechOpen(false)}>Close</Button>}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#334155" }}>
            Next.js · React · Ant Design · Tailwind CSS · NestJS · Prisma · PostgreSQL · Redis · Vuteq SSO
          </p>
          <SafetyCertificateOutlined style={{ fontSize: 32, color: "#4C6A85", margin: "12px 0" }} />
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 12, alignItems: "center" }}>
            <Image src={withBasePath("/images/ssl.png")} alt="SSL Secured" width={110} height={28} />
            <Image src={withBasePath("/images/aes.webp")} alt="AES 256 Encryption" width={50} height={50} />
          </div>
        </div>
      </Modal>

      <Modal
        title="Privacy Policy"
        open={privacyOpen}
        centered
        width={760}
        onCancel={() => setPrivacyOpen(false)}
        footer={<Button type="primary" onClick={() => setPrivacyOpen(false)}>Close</Button>}
        styles={{ body: { maxHeight: "65vh", overflowY: "auto" } }}
      >
        <Title level={4}>Data Protection & Operational Policy</Title>
        <Paragraph>
          WH Packer System memproses data autentikasi Vuteq SSO, role permission, operasional packing, inventori, dan catatan perpindahan stok PT Vuteq Indonesia.
        </Paragraph>
        <Title level={5}>Keamanan & Audit</Title>
        <Paragraph>
          Setiap transaksi dilindungi oleh enkripsi transport, token SSO terlindungi, dan seluruh aksi operasional terotorisasi sesuai hak akses least privilege.
        </Paragraph>
      </Modal>

      <Modal
        title="Update Log"
        open={updatesOpen}
        centered
        width={700}
        onCancel={() => setUpdatesOpen(false)}
        footer={<Button type="primary" onClick={() => setUpdatesOpen(false)}>Close</Button>}
      >
        <Timeline
          items={[
            { children: "v1.0.0 — Inisialisasi WH Packer System, integrasi SSO BFF, Master Data, Warehouse & Packer Reports." },
            { children: "Standardisasi Corporate UI / UX selaras dengan ITAM PT Vuteq Indonesia." },
          ]}
        />
      </Modal>
    </>
  );
}
