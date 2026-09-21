--
-- PostgreSQL database dump
--

\restrict 4rKFUq01A1OWMCaZzV5fEK4QF7QQ2eGVKIYT3j9cHWGPBvR0smTBqXLUS4gCEz4

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analyses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analyses (
    id integer NOT NULL,
    hasta_id integer NOT NULL,
    doktor_id integer NOT NULL,
    klinik_id integer NOT NULL,
    appointment_id integer,
    organ character varying(20) NOT NULL,
    model character varying(20) NOT NULL,
    durum character varying(20) DEFAULT 'bekliyor'::character varying,
    olusturulma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT analyses_durum_check CHECK (((durum)::text = ANY ((ARRAY['bekliyor'::character varying, 'tamamlandi'::character varying, 'onaylandi'::character varying])::text[]))),
    CONSTRAINT analyses_model_check CHECK (((model)::text = ANY ((ARRAY['unet'::character varying, 'unet_plus'::character varying])::text[]))),
    CONSTRAINT analyses_organ_check CHECK (((organ)::text = ANY ((ARRAY['beyin'::character varying, 'bobrek'::character varying])::text[])))
);


ALTER TABLE public.analyses OWNER TO postgres;

--
-- Name: analyses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analyses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analyses_id_seq OWNER TO postgres;

--
-- Name: analyses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analyses_id_seq OWNED BY public.analyses.id;


--
-- Name: analysis_slices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analysis_slices (
    id integer NOT NULL,
    analiz_id integer NOT NULL,
    goruntu_yolu character varying(500) NOT NULL,
    maske_yolu text,
    patoloji_yuzdesi numeric(5,2),
    max_olasilik numeric(5,4),
    sira_no integer NOT NULL,
    olusturulma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    alan_mm2 real DEFAULT 0,
    cevre_mm real DEFAULT 0,
    guven_skoru real DEFAULT 0
);


ALTER TABLE public.analysis_slices OWNER TO postgres;

--
-- Name: analysis_slices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analysis_slices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analysis_slices_id_seq OWNER TO postgres;

--
-- Name: analysis_slices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analysis_slices_id_seq OWNED BY public.analysis_slices.id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    hasta_id integer NOT NULL,
    doktor_id integer NOT NULL,
    klinik_id integer NOT NULL,
    tarih_saat timestamp without time zone NOT NULL,
    durum character varying(20) DEFAULT 'bekliyor'::character varying,
    notlar text,
    olusturulma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_durum_check CHECK (((durum)::text = ANY ((ARRAY['bekliyor'::character varying, 'onaylandi'::character varying, 'iptal'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: clinics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinics (
    id integer NOT NULL,
    ad character varying(255) NOT NULL,
    adres text,
    telefon character varying(20),
    email character varying(255),
    olusturulma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clinics OWNER TO postgres;

--
-- Name: clinics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinics_id_seq OWNER TO postgres;

--
-- Name: clinics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinics_id_seq OWNED BY public.clinics.id;


--
-- Name: doctor_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_availability (
    id integer NOT NULL,
    doktor_id integer NOT NULL,
    gun character varying(20) NOT NULL,
    baslangic_saati time without time zone NOT NULL,
    bitis_saati time without time zone NOT NULL,
    CONSTRAINT doctor_availability_gun_check CHECK (((gun)::text = ANY ((ARRAY['Pazartesi'::character varying, 'Sali'::character varying, 'Carsamba'::character varying, 'Persembe'::character varying, 'Cuma'::character varying, 'Cumartesi'::character varying, 'Pazar'::character varying])::text[])))
);


ALTER TABLE public.doctor_availability OWNER TO postgres;

--
-- Name: doctor_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_availability_id_seq OWNER TO postgres;

--
-- Name: doctor_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_availability_id_seq OWNED BY public.doctor_availability.id;


--
-- Name: doctor_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_notes (
    id integer NOT NULL,
    analiz_id integer NOT NULL,
    doktor_id integer NOT NULL,
    icerik text NOT NULL,
    hasta_gorebilir_mi boolean DEFAULT false,
    olusturulma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctor_notes OWNER TO postgres;

--
-- Name: doctor_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_notes_id_seq OWNER TO postgres;

--
-- Name: doctor_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_notes_id_seq OWNED BY public.doctor_notes.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    user_id integer NOT NULL,
    klinik_id integer,
    unvan character varying(50) NOT NULL,
    uzmanlik character varying(50) NOT NULL,
    organ character varying(20) NOT NULL,
    biyografi text,
    CONSTRAINT doctors_organ_check CHECK (((organ)::text = ANY ((ARRAY['beyin'::character varying, 'bobrek'::character varying])::text[]))),
    CONSTRAINT doctors_unvan_check CHECK (((unvan)::text = ANY ((ARRAY['Prof.Dr'::character varying, 'Doc.Dr'::character varying, 'Dr'::character varying, 'Uzm.Dr'::character varying])::text[]))),
    CONSTRAINT doctors_uzmanlik_check CHECK (((uzmanlik)::text = ANY ((ARRAY['Noroloji'::character varying, 'Uroloji'::character varying, 'Radyoloji'::character varying, 'Onkoloji'::character varying])::text[])))
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    kullanici_id integer NOT NULL,
    tip character varying(10) DEFAULT 'email'::character varying,
    konu character varying(255),
    mesaj text NOT NULL,
    gonderildi_mi boolean DEFAULT false,
    tarih timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_tip_check CHECK (((tip)::text = 'email'::text))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    doktor_id integer NOT NULL,
    cinsiyet character varying(10),
    adres text,
    kan_grubu character varying(5),
    user_id integer,
    tc_kimlik character varying(11),
    CONSTRAINT patients_cinsiyet_check CHECK (((cinsiyet)::text = ANY ((ARRAY['Erkek'::character varying, 'Kadin'::character varying])::text[]))),
    CONSTRAINT patients_kan_grubu_check CHECK (((kan_grubu)::text = ANY ((ARRAY['A+'::character varying, 'A-'::character varying, 'B+'::character varying, 'B-'::character varying, 'AB+'::character varying, 'AB-'::character varying, '0+'::character varying, '0-'::character varying])::text[])))
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    analiz_id integer NOT NULL,
    pdf_yolu character varying(500) NOT NULL,
    olusturulma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    ad character varying(100) NOT NULL,
    soyad character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    sifre character varying(255),
    rol character varying(20) NOT NULL,
    tc_kimlik character varying(11),
    dogum_tarihi date,
    telefon character varying(20),
    dil character varying(5) DEFAULT 'tr'::character varying,
    aktif boolean DEFAULT true,
    olusturulma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_dil_check CHECK (((dil)::text = ANY ((ARRAY['tr'::character varying, 'en'::character varying])::text[]))),
    CONSTRAINT users_rol_check CHECK (((rol)::text = ANY ((ARRAY['superadmin'::character varying, 'doktor'::character varying, 'hasta'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: analyses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses ALTER COLUMN id SET DEFAULT nextval('public.analyses_id_seq'::regclass);


--
-- Name: analysis_slices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_slices ALTER COLUMN id SET DEFAULT nextval('public.analysis_slices_id_seq'::regclass);


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: clinics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinics ALTER COLUMN id SET DEFAULT nextval('public.clinics_id_seq'::regclass);


--
-- Name: doctor_availability id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability ALTER COLUMN id SET DEFAULT nextval('public.doctor_availability_id_seq'::regclass);


--
-- Name: doctor_notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_notes ALTER COLUMN id SET DEFAULT nextval('public.doctor_notes_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: analyses analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_pkey PRIMARY KEY (id);


--
-- Name: analysis_slices analysis_slices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_slices
    ADD CONSTRAINT analysis_slices_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: clinics clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_pkey PRIMARY KEY (id);


--
-- Name: doctor_availability doctor_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_pkey PRIMARY KEY (id);


--
-- Name: doctor_notes doctor_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_notes
    ADD CONSTRAINT doctor_notes_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: analyses analyses_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: analyses analyses_doktor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_doktor_id_fkey FOREIGN KEY (doktor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: analyses analyses_hasta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_hasta_id_fkey FOREIGN KEY (hasta_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: analyses analyses_klinik_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_klinik_id_fkey FOREIGN KEY (klinik_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: analysis_slices analysis_slices_analiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_slices
    ADD CONSTRAINT analysis_slices_analiz_id_fkey FOREIGN KEY (analiz_id) REFERENCES public.analyses(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_doktor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doktor_id_fkey FOREIGN KEY (doktor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_hasta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_hasta_id_fkey FOREIGN KEY (hasta_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_klinik_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_klinik_id_fkey FOREIGN KEY (klinik_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: doctor_availability doctor_availability_doktor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_doktor_id_fkey FOREIGN KEY (doktor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctor_notes doctor_notes_analiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_notes
    ADD CONSTRAINT doctor_notes_analiz_id_fkey FOREIGN KEY (analiz_id) REFERENCES public.analyses(id) ON DELETE CASCADE;


--
-- Name: doctor_notes doctor_notes_doktor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_notes
    ADD CONSTRAINT doctor_notes_doktor_id_fkey FOREIGN KEY (doktor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctors doctors_klinik_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_klinik_id_fkey FOREIGN KEY (klinik_id) REFERENCES public.clinics(id) ON DELETE SET NULL;


--
-- Name: doctors doctors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_kullanici_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_kullanici_id_fkey FOREIGN KEY (kullanici_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: patients patients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_user_id_fkey FOREIGN KEY (doktor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_analiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_analiz_id_fkey FOREIGN KEY (analiz_id) REFERENCES public.analyses(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 4rKFUq01A1OWMCaZzV5fEK4QF7QQ2eGVKIYT3j9cHWGPBvR0smTBqXLUS4gCEz4

