import { describe, expect, it } from "bun:test";
import jwt from "jsonwebtoken";
import { JwtService } from "./JwtService";

const secret = process.env.JWT_SECRET as string;

describe("JwtService", () => {
	const service = new JwtService();

	it("firma y verifica tokens HS256", () => {
		const token = service.generateToken({ id: 1, role: "USER" });

		expect(jwt.decode(token, { complete: true })?.header.alg).toBe("HS256");
		expect(service.verifyToken(token)).toMatchObject({ id: 1, role: "USER" });
	});

	it("rechaza tokens firmados con otro algoritmo aunque usen el mismo secreto", () => {
		const hs512 = jwt.sign({ id: 1 }, secret, { algorithm: "HS512" });
		expect(() => service.verifyToken(hs512)).toThrow();
	});

	it("rechaza tokens sin firma (alg none)", () => {
		const sinFirma = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from('{"id":1,"role":"ADMIN"}').toString("base64url")}.`;
		expect(() => service.verifyToken(sinFirma)).toThrow();
	});

	it("rechaza tokens expirados o con firma incorrecta", () => {
		const expirado = jwt.sign({ id: 1 }, secret, {
			algorithm: "HS256",
			expiresIn: -10,
		});
		const ajeno = jwt.sign({ id: 1 }, "otro-secreto", { algorithm: "HS256" });

		expect(() => service.verifyToken(expirado)).toThrow();
		expect(() => service.verifyToken(ajeno)).toThrow();
	});
});
